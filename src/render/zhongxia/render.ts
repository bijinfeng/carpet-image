import lbFlower from '@/assets/zhongxia/lbhua.png';
import rtFlower from '@/assets/zhongxia/rthua.png';
import textImage from '@/assets/zhongxia/zhongxia-text.png';
import { PIXEL_RATIO } from '@/constants';
import { RectRadius } from '@/lib/rect-radius';
import { calculateImageScale } from '@/lib/utils';
import type { IRadius, IRenderCarpet, RenderProps } from '@/types';
import { Decimal } from 'decimal.js';

const BLOCK_SIZE = Decimal.div(39, PIXEL_RATIO).toNumber();
const BLOCK_PADDING = Decimal.div(10, PIXEL_RATIO).toNumber();
const RECT_SIZE = Decimal.div(60, PIXEL_RATIO).toNumber();

// 麦穗
const wheatearData = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="39.11962890625" height="78.45852661132812" viewBox="0 0 39.11962890625 78.45852661132812" fill="none">
  <path d="M39.1197 78.4585C17.5149 78.4585 0.000976562 60.8953 0.000976562 39.2298C21.6057 39.2298 39.1197 56.793 39.1197 78.4585Z" fill="#000000">
  </path>
  <path d="M0 39.2288C21.6048 39.2288 39.1187 21.6655 39.1187 0C17.514 0 0 17.5633 0 39.2288Z" fill="#FFFFFF">
  </path>
</svg>
`;

// 存储切割点信息
interface CutPoint {
	position: paper.Point;
	angle: number; // 旋转角度（单位：度）
	svgItem?: paper.Item;
}

class Render extends RectRadius implements IRenderCarpet {
	private centerText: paper.Raster | null = null; // 中间文字
	private lbFlower: paper.Raster | null = null; // 左下角花朵
	private rtFlower: paper.Raster | null = null; // 右上角花朵
	private wheatearItem: paper.Item; // 麦穗

	private imageScale = 1; // 图片缩放比例
	private radii!: IRadius; // 调整每个圆角的大小,确保其值不会过大,导致圆角重叠或超出矩形边界
	private rectOffsetPath: paper.Path | null = null; // 麦穗的边界
	private blockPadding = BLOCK_PADDING; // 麦穗之间的间隔

	private cutPoints: CutPoint[] = [];
	private layer1: paper.Layer;
	private layer2: paper.Layer;
	private insidePath: paper.Path | null = null;
	private outsidePath: paper.PathItem | null = null;

	constructor(scope: paper.PaperScope) {
		super(scope);

		// 创建两个图层，第一个图层负责渲染背景色和花朵图案，第二个图层负责渲染描边，麦穗和中文的文字
		this.layer1 = new this.scope.Layer();
		this.layer2 = new this.scope.Layer();

		this.wheatearItem = scope.project.importSVG(wheatearData, {
			expandShapes: true,
			onLoad: (svg: paper.Item) => {
				svg.bounds.width = BLOCK_SIZE;
				svg.bounds.height = BLOCK_SIZE * 2;
				svg.visible = false;
			},
		});
	}

	private _watchProps(props: RenderProps) {
		this.imageScale = calculateImageScale(props.height);
		this.radii = this.modifyRectRadius(props.width, props.height, props.radius);
	}

	private _createRect(props: RenderProps) {
		this.insidePath?.remove();
		this.outsidePath?.remove();
		this.rectOffsetPath?.remove();

		for (const { svgItem } of this.cutPoints) {
			svgItem?.remove();
		}

		// 绘制白色的背景色
		this.insidePath = this.drawRectRadius(
			RECT_SIZE,
			RECT_SIZE,
			props.width - RECT_SIZE * 2,
			props.height - RECT_SIZE * 2,
			this.changeRadius(this.radii, RECT_SIZE),
		);
		this.insidePath.fillColor = new this.scope.Color('white');
		this.layer1.addChild(this.insidePath);

		// 绘制黑色的边框
		this.outsidePath = this.drawRectRadius(0, 0, props.width, props.height, this.radii).subtract(this.insidePath);
		this.outsidePath.fillColor = new this.scope.Color('black');
		this.layer2.addChild(this.outsidePath);

		// 由于矩形的宽高不固定，需要修正麦穗的间隔使得麦穗的大小固定
		this.blockPadding = this.calculateBlockPadding(this.insidePath, BLOCK_SIZE, BLOCK_PADDING);
		this.cutPoints = this.splitPath(this.insidePath, BLOCK_SIZE + this.blockPadding);

		// 没有圆角的角落需要有一定的空白间隔，绘制麦穗可落点的空间
		this.rectOffsetPath = this.getRectOffsetPath(
			RECT_SIZE,
			RECT_SIZE,
			props.width - RECT_SIZE * 2,
			props.height - RECT_SIZE * 2,
			this.changeRadius(this.radii, RECT_SIZE),
			BLOCK_SIZE * 1.5 + this.blockPadding,
		);
		this.layer2.addChild(this.rectOffsetPath);

		this._drawCutPoints();
	}

	// 绘制麦穗
	private _drawCutPoints() {
		for (const point of this.cutPoints) {
			const isOffset = !this.rectOffsetPath || this.rectOffsetPath.contains(point.position);

			const imgRaster = this.wheatearItem.clone();

			imgRaster.position = point.position;
			imgRaster.rotate(point.angle);
			imgRaster.visible = isOffset;

			this.layer2.addChild(imgRaster);

			point.svgItem = imgRaster;
		}
	}

	private _createCenterText(_props: RenderProps) {
		// 中间文字
		this.centerText?.remove();
		this.centerText = new this.scope.Raster(textImage);
		this.centerText.position = this.scope.view.center;
		this.centerText.scale(this.imageScale);
		this.layer2.addChild(this.centerText);
	}

	private _createLBFlower(props: RenderProps) {
		this.lbFlower?.remove();

		// 左下角花朵
		const lbFlowerItem = new this.scope.Raster(lbFlower);

		lbFlowerItem.onLoad = () => {
			const imageSize = lbFlowerItem.bounds.size;
			const imageWidth = imageSize.width * this.imageScale;
			const imageHeight = imageSize.height * this.imageScale;

			const arcStartPoint = new this.scope.Point(0, props.height - this.radii.leftBottom);
			const arcEndPoint = new this.scope.Point(this.radii.leftBottom, props.height);
			const arcCenterPoint = new this.scope.Point(this.radii.leftBottom, props.height - this.radii.leftBottom);
			const middlePoint = this.calculateArcCenter(arcStartPoint, arcEndPoint, arcCenterPoint);
			const pointY = Math.min(props.height, middlePoint.y * 1.1);
			const position = new this.scope.Point(imageWidth / 2 + middlePoint.x * 0.8, pointY - imageHeight / 2);

			lbFlowerItem.position = position;
			lbFlowerItem.scale(this.imageScale);
			lbFlowerItem.bringToFront();
			this.layer1.addChild(lbFlowerItem);
		};

		this.lbFlower = lbFlowerItem;
	}

	private _createRTFlower(props: RenderProps) {
		this.rtFlower?.remove();

		// 右上角花朵
		const rtFlowerItem = new this.scope.Raster(rtFlower);

		rtFlowerItem.onLoad = () => {
			const imageSize = rtFlowerItem.bounds.size;
			const imageWidth = imageSize.width * this.imageScale;
			const imageHeight = imageSize.height * this.imageScale;

			const arcStartPoint = new this.scope.Point(props.width - this.radii.rightTop, 0);
			const arcEndPoint = new this.scope.Point(props.width, this.radii.rightTop);
			const arcCenterPoint = new this.scope.Point(props.width - this.radii.rightTop, this.radii.rightTop);
			const middlePoint = this.calculateArcCenter(arcStartPoint, arcEndPoint, arcCenterPoint);

			const position = new this.scope.Point(middlePoint.x - imageWidth / 2, 21 + imageHeight / 2 + middlePoint.y);

			rtFlowerItem.position = position;
			rtFlowerItem.scale(this.imageScale);
			rtFlowerItem.bringToFront();
			this.layer1.addChild(rtFlowerItem);
		};

		this.rtFlower = rtFlowerItem;
	}

	render(props: RenderProps) {
		this._watchProps(props);

		this._createRect(props);
		this._createCenterText(props);
		this._createLBFlower(props);
		this._createRTFlower(props);
	}
}

export const render = (scope: paper.PaperScope) => new Render(scope);
