import textImage from '@/assets/moli/moli-text.jpg';
import { CM_TO_PX } from '@/constants';
import { RectRadius } from '@/lib/rect-radius';
import { calculateImageScale, calculateOptimalSquareSize } from '@/lib/utils';
import type { IRadius, IRenderCarpet, RenderProps } from '@/types';

const IMAGE_WIDTH = 1511;
const IMAGE_HEIGHT = 123;
const BLOCK_SIZE = 60;
const BLOCK_PADDING = 30;

class Render extends RectRadius implements IRenderCarpet {
	private centerText: paper.Raster | null = null; // 中间文字
	private borderPath: paper.Path | null = null; // 边框路径
	private insidePath: paper.Path | null = null;
	private outsidePath: paper.PathItem | null = null;

	private imageScale = 1; // 图片缩放比例
	private radii!: IRadius; // 调整每个圆角的大小,确保其值不会过大,导致圆角重叠或超出矩形边界
	private blockSize = BLOCK_SIZE;

	constructor(private scope: paper.PaperScope) {
		super(scope);
	}

	private _watchProps(props: RenderProps) {
		this.imageScale = calculateImageScale(props.height);
		this.radii = this.modifyRectRadius(props.width, props.height, props.radius);
		this.blockSize = calculateOptimalSquareSize({
			x: props.width - BLOCK_PADDING * 2,
			y: props.height - BLOCK_PADDING * 2,
			defaultSize: BLOCK_SIZE,
			tolerance: 0.2 * CM_TO_PX,
			evenOdd: 'odd',
		});
	}

	private _createCenterText(props: RenderProps) {
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

		const radii = this.changeRadius(this.radii, BLOCK_PADDING / 2);

		this.borderPath = this.drawRectRadius(
			BLOCK_PADDING / 2,
			BLOCK_PADDING / 2,
			props.width - BLOCK_PADDING,
			props.height - BLOCK_PADDING,
			radii,
		);

		this.borderPath.fillColor = new this.scope.Color('white');
		this.borderPath.strokeWidth = BLOCK_PADDING;
		this.borderPath.strokeColor = new this.scope.Color('black');
	}

	private _createInsidePath(props: RenderProps) {
		this.insidePath?.remove();

		const offset = BLOCK_PADDING + this.blockSize * 1.5;
		const radii = this.changeRadius(this.radii, offset);

		this.insidePath = this.drawRectRadius(offset, offset, props.width - offset * 2, props.height - offset * 2, radii);

		this.insidePath.strokeWidth = this.blockSize;
		this.insidePath.strokeColor = new this.scope.Color('black');
		this.insidePath.dashArray = [this.blockSize, this.blockSize];
	}

	private _createOutsidePath(props: RenderProps) {
		this.outsidePath?.remove();

		const offset = BLOCK_PADDING + this.blockSize * 0.5;
		const radii = this.changeRadius(this.radii, offset);

		this.outsidePath = this.drawRectRadius(offset, offset, props.width - offset * 2, props.height - offset * 2, radii);

		this.outsidePath.strokeWidth = this.blockSize;
		this.outsidePath.strokeColor = new this.scope.Color('black');
		this.outsidePath.dashArray = [this.blockSize, this.blockSize];
	}

	render(props: RenderProps) {
		this._watchProps(props);

		this._createBorderPath(props);
		this._createInsidePath(props);
		this._createOutsidePath(props);
		this._createCenterText(props);
	}
}

export const render = (scope: paper.PaperScope) => new Render(scope);
