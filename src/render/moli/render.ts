import textImage from '@/assets/moli/moli-text.jpg';
import { CM_TO_PX } from '@/constants';
import { RectRadius } from '@/lib/rect-radius';
import { calculateImageScale } from '@/lib/utils';
import type { IRadius, IRenderCarpet, RenderProps } from '@/types';
import { fill, last } from 'lodash-es';

const IMAGE_WIDTH = 1511;
const IMAGE_HEIGHT = 123;
const BLOCK_SIZE = CM_TO_PX * 2;
const BLOCK_PADDING = CM_TO_PX;

class Render extends RectRadius implements IRenderCarpet {
	private centerText: paper.Raster | null = null; // 中间文字
	private borderPath: paper.Path | null = null; // 边框路径

	private imageScale = 1; // 图片缩放比例
	private radii!: IRadius; // 调整每个圆角的大小,确保其值不会过大,导致圆角重叠或超出矩形边界
	private blockSize = BLOCK_SIZE;

	private insideClipGroup: paper.Group | null = null;
	private outsideClipGroup: paper.Group | null = null;

	private segmentDashCount: number[] = [];

	// biome-ignore lint/complexity/noUselessConstructor: <explanation>
	constructor(scope: paper.PaperScope) {
		super(scope);
	}

	private _watchProps(props: RenderProps) {
		this.imageScale = calculateImageScale(props.height);
		this.radii = this.modifyRectRadius(props.width, props.height, props.radius);

		// 因为矩形的宽高不固定，为了让每个格子的大小一致，需要动态计算每个格子的大小
		const offset = BLOCK_PADDING;
		const rectWidth = props.width - offset * 2;
		const rectHeight = props.height - offset * 2;
		const radii = this.changeRadius(this.radii, offset);
		const segmentGroup = this.calculatePathSegmentLength(rectWidth, rectHeight, radii);

		// 是否只有一根线段
		const isOnlyOneSegment = segmentGroup.length === 1;
		const segmentDashCount: number[] = [];

		const [allBlockCount, allRemainSpace] = segmentGroup.reduce(
			(acc, curr) => {
				let blockCount = Math.floor(curr / BLOCK_SIZE);
				// 剩余空间
				let remainSpace = curr - blockCount * BLOCK_SIZE;

				// 只有一根线段时，线段上能绘制的格子数必须是偶数, 有多个线段时，每个线段能绘制的格子数必须是奇数
				if ((isOnlyOneSegment && blockCount % 2 !== 0) || (!isOnlyOneSegment && blockCount % 2 === 0)) {
					blockCount -= 1;
					remainSpace += BLOCK_SIZE;
				}

				segmentDashCount.push(blockCount);

				acc[0] += blockCount;
				acc[1] += remainSpace;

				return acc;
			},
			[0, 0],
		);

		// 每个格子需要补充的长度
		const remaiPadding = allRemainSpace / allBlockCount;
		this.blockSize = BLOCK_SIZE + remaiPadding;
		this.segmentDashCount = segmentDashCount;
	}

	// 生成格子之间间隔，在直角的拐角处，间隔需要乘二
	private _generateDashArray(): number[] {
		const arr = this.segmentDashCount.map((it) => fill(Array(it), this.blockSize));

		// 初始化结果数组,放入第一个子数组的第一个元素
		const dashArray: number[] = [];

		for (let i = 0; i < arr.length; i++) {
			const subArray = arr[i];

			for (let j = 0; j < subArray.length; j++) {
				// 处理每个子数组的第一个元素
				if (j === 0) {
					const lastDash = last(dashArray) || 0;
					dashArray[Math.max(dashArray.length - 1, 0)] = lastDash + subArray[j];
				} else {
					dashArray.push(subArray[j]);
				}
			}
		}

		return dashArray;
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
		this.borderPath = this.drawRectRadius(0, 0, props.width, props.height, this.radii);
		this.borderPath.fillColor = new this.scope.Color('black');
	}

	private _createDashPath(props: RenderProps) {
		this.insideClipGroup?.remove();
		this.outsideClipGroup?.remove();

		const offset = BLOCK_PADDING;
		const rectWidth = props.width - offset * 2;
		const rectHeight = props.height - offset * 2;
		const radii = this.changeRadius(this.radii, offset);

		// 第一圈虚线
		const dashPath1 = this.drawRectRadius(offset, offset, rectWidth, rectHeight, radii);
		dashPath1.strokeWidth = this.blockSize * 2;
		dashPath1.strokeColor = new this.scope.Color('black');
		dashPath1.dashArray = this._generateDashArray();
		dashPath1.fillColor = new this.scope.Color('white');

		const insideOffset = BLOCK_PADDING + this.blockSize;
		const insideRectWidth = props.width - insideOffset * 2;
		const insideRectHeight = props.height - insideOffset * 2;
		const insideRadii = this.changeRadius(this.radii, insideOffset);
		const insidePath = this.drawRectRadius(insideOffset, insideOffset, insideRectWidth, insideRectHeight, insideRadii);

		this.insideClipGroup = new this.scope.Group([dashPath1.subtract(insidePath), dashPath1]);
		this.insideClipGroup.clipped = true;

		// 第二圈虚线
		const dashPath2 = dashPath1.clone();
		dashPath2.strokeWidth = this.blockSize * 4;
		dashPath2.strokeColor = new this.scope.Color('black');
		dashPath2.dashOffset = this.blockSize;

		this.outsideClipGroup = new this.scope.Group([insidePath.clone(), dashPath2]);
		this.outsideClipGroup.clipped = true;

		insidePath.remove();
	}

	render(props: RenderProps) {
		this._watchProps(props);

		this._createBorderPath(props);
		this._createDashPath(props);
		this._createCenterText(props);
	}
}

export const render = (scope: paper.PaperScope) => new Render(scope);
