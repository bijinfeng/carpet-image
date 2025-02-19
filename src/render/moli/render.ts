import textImage from '@/assets/moli/moli-text.jpg';
import { CM_TO_PX } from '@/constants';
import { RectRadius } from '@/lib/rect-radius';
import { tempCanvasRender } from '@/lib/temp-canvas';
import { calculateImageScale } from '@/lib/utils';
import type { IRadius, IRenderCarpet, RenderProps } from '@/types';
import { Decimal } from 'decimal.js';

const IMAGE_WIDTH = 1511;
const IMAGE_HEIGHT = 123;
const BLOCK_SIZE = CM_TO_PX * 2;
const BLOCK_PADDING = CM_TO_PX;

class Render extends RectRadius implements IRenderCarpet {
	private centerText: paper.Raster | null = null; // 中间文字
	private borderPath: paper.Path | null = null; // 边框路径
	private dashImage: paper.Item | null = null; // 虚线图片

	private imageScale = 1; // 图片缩放比例
	private radii!: IRadius; // 调整每个圆角的大小,确保其值不会过大,导致圆角重叠或超出矩形边界
	private blockSize = BLOCK_SIZE;
	private rectWidth = 0;
	private rectHeight = 0;

	// biome-ignore lint/complexity/noUselessConstructor: <explanation>
	constructor(scope: paper.PaperScope) {
		super(scope);
	}

	private _calculateRectOffset(props: RenderProps) {
		const rectWidth = Decimal.sub(props.width, Decimal.mul(BLOCK_PADDING, 2)).toNumber();
		const rectHeight = Decimal.sub(props.height, Decimal.mul(BLOCK_PADDING, 2)).toNumber();

		let blockXCount = Decimal.div(rectWidth, BLOCK_SIZE).floor().toNumber();
		let remainingXSpace = Decimal.mod(rectWidth, BLOCK_SIZE).toNumber();
		if (blockXCount % 2 === 0) {
			blockXCount += 1;
			remainingXSpace = Decimal.add(remainingXSpace, BLOCK_SIZE).toNumber();
		}

		let blockYCount = Decimal.div(rectHeight, BLOCK_SIZE).floor().toNumber();
		let remainingYSpace = Decimal.mod(rectHeight, BLOCK_SIZE).toNumber();
		if (blockYCount % 2 === 0) {
			blockYCount += 1;
			remainingYSpace = Decimal.add(remainingYSpace, BLOCK_SIZE).toNumber();
		}

		const perBlockXSpace = Decimal.div(remainingXSpace, blockXCount).toNumber();
		const perBlockYSpace = Decimal.div(remainingYSpace, blockXCount).toNumber();
		const minBlockSpace = Math.min(perBlockXSpace, perBlockYSpace);

		this.blockSize += minBlockSpace;
		this.rectWidth = Decimal.mul(blockXCount, this.blockSize).toNumber();
		this.rectHeight = Decimal.mul(blockYCount, this.blockSize).toNumber();
	}

	private _watchProps(props: RenderProps) {
		this.imageScale = calculateImageScale(props.height);
		this._calculateRectOffset(props);

		this.radii = this.modifyRectRadius(this.rectWidth, this.rectHeight, props.radius);
	}

	private _createCenterText(props: RenderProps) {
		this.scope.activate();
		const textSize = new this.scope.Size(IMAGE_WIDTH * this.imageScale, IMAGE_HEIGHT * this.imageScale);
		const position = new this.scope.Point(props.width / 2, props.height / 2);

		// 中间文字
		if (!this.centerText) {
			this.centerText = new this.scope.Raster(textImage);
		}

		this.centerText.position = position;
		this.centerText.size = textSize;
		this.centerText.bringToFront();
	}

	private _createBorderPath(props: RenderProps) {
		this.borderPath?.remove();
		this.borderPath = this.drawRectRadius(0, 0, props.width, props.height, this.radii);
		this.borderPath.fillColor = new this.scope.Color('black');
	}

	private _renderTemp(rectWidth: number, rectHeight: number, blockSize: number, radii: IRadius) {
		tempCanvasRender.scope.activate();
		tempCanvasRender.updateSize(rectWidth, rectHeight);

		const outOffset = Decimal.div(blockSize, 2).toNumber();
		const outRectWidth = rectWidth - blockSize;
		const outRectHeight = rectHeight - blockSize;
		const outRadii = tempCanvasRender.changeRadius(radii, outOffset);
		const outsideDashPath = tempCanvasRender.drawRectRadius(
			outOffset,
			outOffset,
			outRectWidth,
			outRectHeight,
			outRadii,
		);
		outsideDashPath.strokeWidth = blockSize;
		outsideDashPath.strokeColor = new tempCanvasRender.scope.Color('white');
		outsideDashPath.fillColor = new tempCanvasRender.scope.Color('black');
		outsideDashPath.dashArray = [blockSize];
		outsideDashPath.dashOffset = -blockSize / 2;

		const inOffset = Decimal.mul(blockSize, 1.5).toNumber();
		const inRectWidth = rectWidth - blockSize * 3;
		const inRectHeight = rectHeight - blockSize * 3;
		const inRadii = tempCanvasRender.changeRadius(radii, inOffset);
		const insideDashPath = tempCanvasRender.drawRectRadius(inOffset, inOffset, inRectWidth, inRectHeight, inRadii);
		insideDashPath.strokeWidth = blockSize;
		insideDashPath.strokeColor = new tempCanvasRender.scope.Color('white');
		insideDashPath.fillColor = new tempCanvasRender.scope.Color('white');
		insideDashPath.dashArray = [blockSize];
		insideDashPath.dashOffset = -blockSize / 2;

		const copyInsideDashPath = insideDashPath.clone();
		copyInsideDashPath.strokeColor = new tempCanvasRender.scope.Color('black');
		copyInsideDashPath.dashOffset += blockSize;

		tempCanvasRender.scope.view.update();
		const svgText = tempCanvasRender.exportSVG();

		outsideDashPath.remove();
		insideDashPath.remove();
		copyInsideDashPath.remove();

		return svgText;
	}

	private _createDashPath(props: RenderProps) {
		this.dashImage?.remove();
		const containerWidth = Decimal.sub(props.width, Decimal.mul(BLOCK_PADDING, 2)).toNumber();
		const containerHeight = Decimal.sub(props.height, Decimal.mul(BLOCK_PADDING, 2)).toNumber();

		const dashImageSVG = this._renderTemp(this.rectWidth, this.rectHeight, this.blockSize, this.radii);

		this.scope.activate();

		this.dashImage = this.scope.project.importSVG(dashImageSVG, {
			expandShapes: true,
			onLoad: (svg: paper.Item) => {
				svg.applyMatrix = false;
				svg.bounds.width = containerWidth;
				svg.bounds.height = containerHeight;
				svg.position = new this.scope.Point(props.width / 2, props.height / 2);
			},
		});
	}

	render(props: RenderProps) {
		this._watchProps(props);

		this._createBorderPath(props);
		this._createDashPath(props);
		this._createCenterText(props);
	}
}

export const render = (scope: paper.PaperScope) => new Render(scope);
