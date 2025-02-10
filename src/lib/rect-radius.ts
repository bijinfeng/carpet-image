import type { IRadius } from '@/types';

export interface CutPoint {
	position: paper.Point;
	angle: number; // 旋转角度（单位：度）
}

export class RectRadius {
	private rectScope: paper.PaperScope;

	constructor(scope: paper.PaperScope) {
		this.rectScope = scope;
	}

	// 绘制圆角矩形
	public drawRectRadius(rectX: number, rectY: number, rectWidth: number, rectHeight: number, radii: IRadius) {
		const path = new this.rectScope.Path();

		// 计算圆角圆弧的控制点，使用建议的贝塞尔控制点比率
		const kappa = 0.552284749831;

		// 起始点（左上角）
		path.moveTo(new this.rectScope.Point(rectX + radii.leftTop, rectY));

		// 顶边，连接到右上角
		path.lineTo(new this.rectScope.Point(rectX + rectWidth - radii.rightTop, rectY));

		// 右上角弧线
		path.cubicCurveTo(
			new this.rectScope.Point(rectX + rectWidth - (1 - kappa) * radii.rightTop, rectY), // 控制点1
			new this.rectScope.Point(rectX + rectWidth, rectY + (1 - kappa) * radii.rightTop), // 控制点2
			new this.rectScope.Point(rectX + rectWidth, rectY + radii.rightTop), // 终点
		);

		// 右边，连接到右下角
		path.lineTo(new this.rectScope.Point(rectX + rectWidth, rectY + rectHeight - radii.rightBottom));

		// 右下角弧线
		path.cubicCurveTo(
			new this.rectScope.Point(rectX + rectWidth, rectY + rectHeight - (1 - kappa) * radii.rightBottom),
			new this.rectScope.Point(rectX + rectWidth - (1 - kappa) * radii.rightBottom, rectY + rectHeight),
			new this.rectScope.Point(rectX + rectWidth - radii.rightBottom, rectY + rectHeight),
		);

		// 底边，连接到左下角
		path.lineTo(new this.rectScope.Point(rectX + radii.leftBottom, rectY + rectHeight));

		// 左下角弧线
		path.cubicCurveTo(
			new this.rectScope.Point(rectX + (1 - kappa) * radii.leftBottom, rectY + rectHeight),
			new this.rectScope.Point(rectX, rectY + rectHeight - (1 - kappa) * radii.leftBottom),
			new this.rectScope.Point(rectX, rectY + rectHeight - radii.leftBottom),
		);

		// 左边，连接到左上角
		path.lineTo(new this.rectScope.Point(rectX, rectY + radii.leftTop));

		// 左上角弧线
		path.cubicCurveTo(
			new this.rectScope.Point(rectX, rectY + (1 - kappa) * radii.leftTop),
			new this.rectScope.Point(rectX + (1 - kappa) * radii.leftTop, rectY),
			new this.rectScope.Point(rectX + radii.leftTop, rectY),
		);

		// 完成路径闭合
		path.closePath();

		return path;
	}

	// 修改 radius
	public changeRadius(radius: IRadius, insideWidth: number): IRadius {
		const insideRadius: IRadius = {
			leftTop: Math.max(radius.leftTop - insideWidth, 0),
			rightTop: Math.max(radius.rightTop - insideWidth, 0),
			rightBottom: Math.max(radius.rightBottom - insideWidth, 0),
			leftBottom: Math.max(radius.leftBottom - insideWidth, 0),
		};

		return insideRadius;
	}

	// 计算弧线的中间坐标
	public calculateArcCenter(start: paper.Point, end: paper.Point, center: paper.Point) {
		// 计算半径
		const radius = start.getDistance(center);

		// 确定起始角度
		const startAngle = Math.atan2(start.y - center.y, start.x - center.x);

		// 确定终止角度
		const endAngle = Math.atan2(end.y - center.y, end.x - center.x);

		// 计算90度圆弧的中间角度：45度
		const middleAngle = (startAngle + endAngle) / 2;

		// 计算弧线中间点的坐标
		const middleX = center.x + radius * Math.cos(middleAngle);
		const middleY = center.y + radius * Math.sin(middleAngle);

		return { x: middleX, y: middleY };
	}
}
