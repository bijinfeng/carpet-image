import lbFlower from '@/assets/zhongxia/lbhua.png';
import rtFlower from '@/assets/zhongxia/rthua.png';
import textImage from '@/assets/zhongxia/zhongxia-text.png';
import { useImageScale } from '@/hooks';
import { RectRadius } from '@/lib/rect-radius';
import type { IRenderCarpet, RenderProps } from '@/types';

const BLOCK_SIZE = 39;
const BLOCK_PADDING = 10;
const RECT_SIZE = 60;

// 文字图片
const IMAGE_WIDTH = 765;
const IMAGE_HEIGHT = 180;
// 右上角花朵图片
const IMAGE_RTFLOWER_WIDTH = 531;
const IMAGE_RTFLOWER_HEIGHT = 339;
// 左下角花朵图片
const IMAGE_LBFLOWER_WIDTH = 542;
const IMAGE_LBFLOWER_HEIGHT = 437;

const cutWidth = BLOCK_SIZE + BLOCK_PADDING;

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
	private centerText: paper.Raster | null = null;
	private lbFlower: paper.Raster | null = null;
	private rtFlower: paper.Raster | null = null;
	private wheatearItem: paper.Item;

	private imageScale = 1;
	private cutPoints: CutPoint[] = [];
	private layer1: paper.Layer;
	private layer2: paper.Layer;
	private insidePath: paper.Path | null = null;
	private outsidePath: paper.PathItem | null = null;

	constructor(private scope: paper.PaperScope) {
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

	private _createRect(props: RenderProps) {
		this.insidePath?.remove();
		this.outsidePath?.remove();

		for (const { svgItem } of this.cutPoints) {
			svgItem?.remove();
		}

		this.insidePath = this.drawRectRadius(
			RECT_SIZE,
			RECT_SIZE,
			props.width - RECT_SIZE * 2,
			props.height - RECT_SIZE * 2,
			this.changeRadius(props.radius, RECT_SIZE),
		);
		this.insidePath.fillColor = new this.scope.Color('white');
		this.layer1.addChild(this.insidePath);

		this.outsidePath = this.drawRectRadius(0, 0, props.width, props.height, props.radius).subtract(this.insidePath);
		this.outsidePath.fillColor = new this.scope.Color('black');
		this.layer2.addChild(this.outsidePath);

		this.cutPoints = this._splitPath(cutWidth);

		this._drawCutPoints();
	}

	private _splitPath(cutWidth: number) {
		if (!this.insidePath) return [];

		const cutPoints: CutPoint[] = [];

		// 计算总周长
		const totalLength = this.insidePath.length;

		// 沿路径按固定宽度采样
		for (let offset = 0; offset < totalLength; offset += cutWidth) {
			// 获取当前切割点的位置和切线方向
			const point = this.insidePath.getPointAt(offset);
			const tangent = this.insidePath.getTangentAt(offset);

			cutPoints.push({
				position: point,
				angle: tangent.angle, // 计算旋转角度（切线方向转换为角度）
			});
		}

		return cutPoints;
	}

	// 绘制切割点和旋转方向
	private _drawCutPoints() {
		for (const point of this.cutPoints) {
			const imgRaster = this.wheatearItem.clone();
			imgRaster.position = point.position;
			imgRaster.rotate(point.angle);
			imgRaster.visible = true;

			this.layer2.addChild(imgRaster);

			point.svgItem = imgRaster;
		}
	}

	private _createCenterText(props: RenderProps) {
		const textSize = new this.scope.Size(IMAGE_WIDTH * this.imageScale, IMAGE_HEIGHT * this.imageScale);
		const position = new this.scope.Point(props.width / 2, props.height / 2);

		// 中间文字
		if (!this.centerText) {
			this.centerText = new this.scope.Raster(textImage);
			this.layer2.addChild(this.centerText);
		}

		this.centerText.position = position;
		this.centerText.size = textSize;
	}

	private _createLBFlower(props: RenderProps) {
		const imageWidth = IMAGE_LBFLOWER_WIDTH * this.imageScale;
		const imageHeight = IMAGE_LBFLOWER_HEIGHT * this.imageScale;
		const size = new this.scope.Size(imageWidth, imageHeight);

		const arcStartPoint = new this.scope.Point(0, props.height - props.radius.leftBottom);
		const arcEndPoint = new this.scope.Point(props.radius.leftBottom, props.height);
		const arcCenterPoint = new this.scope.Point(props.radius.leftBottom, props.height - props.radius.leftBottom);
		const middlePoint = this.calculateArcCenter(arcStartPoint, arcEndPoint, arcCenterPoint);
		const position = new this.scope.Point(-14 + imageWidth / 2 + middlePoint.x, middlePoint.y - imageHeight / 2);

		if (!this.lbFlower) {
			// 左下角花朵
			this.lbFlower = new this.scope.Raster(lbFlower);
			this.layer1.addChild(this.lbFlower);
		}

		this.lbFlower.position = position;
		this.lbFlower.size = size;
		this.lbFlower.bringToFront();
	}

	private _createRTFlower(props: RenderProps) {
		const imageWidth = IMAGE_RTFLOWER_WIDTH * this.imageScale;
		const imageHeight = IMAGE_RTFLOWER_HEIGHT * this.imageScale;
		const size = new this.scope.Size(imageWidth, imageHeight);

		const arcStartPoint = new this.scope.Point(props.width - props.radius.rightTop, 0);
		const arcEndPoint = new this.scope.Point(props.width, props.radius.rightTop);
		const arcCenterPoint = new this.scope.Point(props.width - props.radius.rightTop, props.radius.rightTop);
		const middlePoint = this.calculateArcCenter(arcStartPoint, arcEndPoint, arcCenterPoint);

		const position = new this.scope.Point(middlePoint.x - imageWidth / 2, 21 + imageHeight / 2 + middlePoint.y);

		if (!this.rtFlower) {
			// 右上角花朵
			this.rtFlower = new this.scope.Raster(rtFlower);
			this.layer1.addChild(this.rtFlower);
		}

		this.rtFlower.position = position;
		this.rtFlower.size = size;
		this.rtFlower.bringToFront();
	}

	init(props: RenderProps) {
		this.imageScale = useImageScale(props).value;
		this._createRect(props);
		this._createCenterText(props);
		this._createLBFlower(props);
		this._createRTFlower(props);
	}

	update(props: RenderProps) {
		this.imageScale = useImageScale(props).value;
		this._createRect(props);
		this._createCenterText(props);
		this._createLBFlower(props);
		this._createRTFlower(props);
	}
}

export const render = (scope: paper.PaperScope) => new Render(scope);
