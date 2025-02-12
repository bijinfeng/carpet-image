import textImage from '@/assets/moli/moli-text.jpg';
import { CM_TO_PX } from '@/constants';
import { RectRadius } from '@/lib/rect-radius';
import { calculateImageScale } from '@/lib/utils';
import type { IRadius, IRenderCarpet, RenderProps } from '@/types';

const IMAGE_WIDTH = 1511;
const IMAGE_HEIGHT = 123;
const BLOCK_SIZE = CM_TO_PX * 2;
const BLOCK_PADDING = CM_TO_PX;

class Render extends RectRadius implements IRenderCarpet {
	private centerText: paper.Raster | null = null; // 中间文字
	private borderPath: paper.Path | null = null; // 边框路径
	private insidePath: paper.Path | null = null;
	private outsidePath: paper.PathItem | null = null;

	private imageScale = 1; // 图片缩放比例
	private radii!: IRadius; // 调整每个圆角的大小,确保其值不会过大,导致圆角重叠或超出矩形边界
	private blockSize = BLOCK_SIZE;
	private blockPadding = BLOCK_PADDING;

	// biome-ignore lint/complexity/noUselessConstructor: <explanation>
	constructor(scope: paper.PaperScope) {
		super(scope);
	}

	private _watchProps(props: RenderProps) {
		this.imageScale = calculateImageScale(props.height);
		this.radii = this.modifyRectRadius(props.width, props.height, props.radius);

		// 因为矩形的宽高不固定，为了让每个格子的大小一致，需要动态计算每个格子的大小
		const segmentLength = this.calculatePathSegmentLength(props.width, props.height, props.radius);
		const [allBlockCount, allRemainSpace] = segmentLength.reduce(
			(acc, curr) => {
				const blockCount = Math.floor(curr / BLOCK_SIZE);
				// 剩余空间
				const remainSpace = curr - blockCount * BLOCK_SIZE;

				acc[0] += blockCount;
				acc[1] += remainSpace;

				return acc;
			},
			[0, 0],
		);

		// 每个格子需要补充的长度
		const remaiPadding = allRemainSpace / allBlockCount;
		this.blockSize = BLOCK_SIZE + remaiPadding;
		this.blockPadding = BLOCK_PADDING - remaiPadding / 2;
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

		const radii = this.changeRadius(this.radii, this.blockPadding / 2);

		this.borderPath = this.drawRectRadius(
			this.blockPadding / 2,
			this.blockPadding / 2,
			props.width - this.blockPadding,
			props.height - this.blockPadding,
			radii,
		);

		this.borderPath.fillColor = new this.scope.Color('white');
		this.borderPath.strokeWidth = this.blockPadding;
		this.borderPath.strokeColor = new this.scope.Color('black');
	}

	private _createInsidePath(props: RenderProps) {
		this.insidePath?.remove();

		const offset = this.blockPadding + this.blockSize * 1.5;
		const radii = this.changeRadius(this.radii, offset);

		this.insidePath = this.drawRectRadius(offset, offset, props.width - offset * 2, props.height - offset * 2, radii);

		this.insidePath.strokeWidth = this.blockSize;
		this.insidePath.strokeColor = new this.scope.Color('black');
		this.insidePath.dashArray = [this.blockSize, this.blockSize];
		this.insidePath.dashOffset = this.blockSize / 2;
	}

	private _createOutsidePath(props: RenderProps) {
		this.outsidePath?.remove();

		const offset = this.blockPadding + this.blockSize * 0.5;
		const radii = this.changeRadius(this.radii, offset);

		this.outsidePath = this.drawRectRadius(offset, offset, props.width - offset * 2, props.height - offset * 2, radii);

		this.outsidePath.strokeWidth = this.blockSize;
		this.outsidePath.strokeColor = new this.scope.Color('black');
		this.outsidePath.dashArray = [this.blockSize, this.blockSize];
		this.outsidePath.dashOffset = this.blockSize / 2;
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
