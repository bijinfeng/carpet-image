import textImage from '@/assets/moli/moli-text.jpg';
import { CM_TO_PX } from '@/constants';
import { RectRadius } from '@/lib/rect-radius';
import { tempCanvasRender } from '@/lib/temp-canvas';
import { calculateImageScale, countDivisibleNumbers } from '@/lib/utils';
import type { IRadius, IRenderCarpet, RenderProps } from '@/types';
import { Decimal } from 'decimal.js';
import { uniq } from 'lodash-es';

const BLOCK_SIZE = Decimal.mul(CM_TO_PX, 2).toNumber();
const BLOCK_PADDING = CM_TO_PX;

class Render extends RectRadius implements IRenderCarpet {
	private centerText: paper.Raster | null = null; // 中间文字
	private borderPath: paper.Path | null = null; // 边框路径
	private dashImage: paper.Item | null = null; // 虚线图片

	private imageScale = 1; // 图片缩放比例
	private blockSize = BLOCK_SIZE;
	private rectWidth = 0;
	private rectHeight = 0;

	// biome-ignore lint/complexity/noUselessConstructor: <explanation>
	constructor(scope: paper.PaperScope) {
		super(scope);
	}

	private _calcaulateOffset(props: RenderProps) {
		const rectWidth = Decimal.sub(props.width, Decimal.mul(BLOCK_PADDING, 2)).toNumber();
		const rectHeight = Decimal.sub(props.height, Decimal.mul(BLOCK_PADDING, 2)).toNumber();
		const originRadii = this.modifyRectRadius(rectWidth, rectHeight, props.radius);
		const radii = this.changeRadius(originRadii, BLOCK_PADDING);

		const segments = this.calculatePathSegmentLength(rectWidth, rectHeight, radii);

		if (segments.length === 1) {
			// 有四个圆角或者三个圆角
			const roundLength = segments[0];

			// 判断是三个圆角还是四个圆角，决定了是需要奇数个方块还是偶数个方块
			const isThreeRounded = Object.values(radii).includes(0);
			const { count, remainingSpace } = countDivisibleNumbers(roundLength, BLOCK_SIZE, isThreeRounded ? 'odd' : 'even');
			const perBlockSpace = Decimal.div(remainingSpace, count).toNumber();

			this.blockSize = Decimal.add(BLOCK_SIZE, perBlockSpace).toNumber();
			this.rectWidth = rectWidth;
			this.rectHeight = rectHeight;
		} else {
			const uniqSegments = uniq(segments);

			const perSegmentBlockSpace = uniqSegments.map((segment) => {
				const { count, remainingSpace } = countDivisibleNumbers(segment, BLOCK_SIZE, 'odd');
				return Decimal.div(remainingSpace, count).toNumber();
			});

			const minPerBlockSpace = Math.min(...perSegmentBlockSpace);

			this.blockSize = Decimal.add(BLOCK_SIZE, minPerBlockSpace).toNumber();
			this.rectWidth = Decimal.mul(
				countDivisibleNumbers(rectWidth, this.blockSize, 'odd').count,
				this.blockSize,
			).toNumber();
			this.rectHeight = Decimal.mul(
				countDivisibleNumbers(rectHeight, this.blockSize, 'odd').count,
				this.blockSize,
			).toNumber();
		}
	}

	private _watchProps(props: RenderProps) {
		this.imageScale = calculateImageScale(props.height);
		this._calcaulateOffset(props);
	}

	private _createCenterText(props: RenderProps) {
		this.scope.activate();
		this.centerText?.remove();

		this.centerText = new this.scope.Raster(textImage);

		let scaleFactor = this.imageScale;

		const textSize = this.centerText.bounds.size;
		const emptyContainerWidth = props.width - BLOCK_PADDING - this.blockSize * 4;
		const emptyContainerHeight = props.height - BLOCK_PADDING - this.blockSize * 4;
		// 判断图片的尺寸是否大于空白容器的尺寸
		if (
			this.imageScale * textSize.width > emptyContainerWidth ||
			this.imageScale * textSize.height > emptyContainerHeight
		) {
			// 图片尺寸大于空白容器尺寸，需要调整图片大小
			scaleFactor = Math.min(
				(emptyContainerWidth / textSize.width) * 0.8,
				(emptyContainerHeight / textSize.height) * 0.8,
			);
		}

		this.centerText.position = this.scope.view.center;
		this.centerText.scale(scaleFactor);
		this.centerText.bringToFront();
	}

	private _createBorderPath(props: RenderProps) {
		const radii = this.modifyRectRadius(props.width, props.height, props.radius);

		this.borderPath?.remove();
		this.borderPath = this.drawRectRadius(0, 0, props.width, props.height, radii);
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

		const insideDashPath = outsideDashPath.clone();
		insideDashPath.strokeWidth = blockSize * 3;
		insideDashPath.dashOffset = blockSize / 2;
		insideDashPath.strokeColor = new tempCanvasRender.scope.Color('white');

		const splitDashPath = tempCanvasRender.drawRectRadius(
			blockSize,
			blockSize,
			Decimal.sub(rectWidth, Decimal.mul(blockSize, 2)).toNumber(),
			Decimal.sub(rectHeight, Decimal.mul(blockSize, 2)).toNumber(),
			tempCanvasRender.changeRadius(radii, blockSize),
		);

		const outsideClipGroup = new tempCanvasRender.scope.Group([splitDashPath, insideDashPath]);
		outsideClipGroup.clipped = true;

		const whitePath = tempCanvasRender.drawRectRadius(
			Decimal.mul(blockSize, 2).toNumber(),
			Decimal.mul(blockSize, 2).toNumber(),
			Decimal.sub(rectWidth, Decimal.mul(blockSize, 4)).toNumber(),
			Decimal.sub(rectHeight, Decimal.mul(blockSize, 4)).toNumber(),
			tempCanvasRender.changeRadius(radii, Decimal.mul(blockSize, 2).toNumber()),
		);
		whitePath.strokeWidth = 1;
		whitePath.strokeColor = new tempCanvasRender.scope.Color('white');
		whitePath.fillColor = new tempCanvasRender.scope.Color('white');

		const svgText = tempCanvasRender.exportSVG();

		outsideDashPath.remove();
		insideDashPath.remove();
		outsideClipGroup.remove();
		whitePath.remove();

		return svgText;
	}

	private _createDashPath(props: RenderProps) {
		this.dashImage?.remove();
		const containerWidth = Decimal.sub(props.width, Decimal.mul(BLOCK_PADDING, 2)).toNumber();
		const containerHeight = Decimal.sub(props.height, Decimal.mul(BLOCK_PADDING, 2)).toNumber();
		const radii = this.modifyRectRadius(this.rectWidth, this.rectHeight, props.radius);

		const dashImageSVG = this._renderTemp(this.rectWidth, this.rectHeight, this.blockSize, radii);

		this.scope.activate();

		this.dashImage = this.scope.project.importSVG(dashImageSVG, {
			expandShapes: true,
			onLoad: (svg: paper.Item) => {
				svg.applyMatrix = false;
				svg.bounds.size = new this.scope.Size(containerWidth, containerHeight);
				svg.position = this.scope.view.center;
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
