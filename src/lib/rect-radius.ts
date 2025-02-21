import type { IRadius } from '@/types';
import Decimal from 'decimal.js';

export interface CutPoint {
	position: paper.Point;
	angle: number; // 旋转角度（单位：度）
}

export class RectRadius {
	constructor(public scope: paper.PaperScope) {}

	// 绘制圆角矩形
	public drawRectRadius(rectX: number, rectY: number, rectWidth: number, rectHeight: number, radii: IRadius) {
		const path = new this.scope.Path();

		// 使用 Decimal.js 来处理高精度计算
		const kappa = new Decimal(0.552284749831);

		// 将输入参数转换为 Decimal 类型
		const x = new Decimal(rectX);
		const y = new Decimal(rectY);
		const width = new Decimal(rectWidth);
		const height = new Decimal(rectHeight);
		const leftTop = new Decimal(radii.leftTop);
		const rightTop = new Decimal(radii.rightTop);
		const rightBottom = new Decimal(radii.rightBottom);
		const leftBottom = new Decimal(radii.leftBottom);

		// 起始点（左上角）
		path.moveTo(new this.scope.Point(x.plus(leftTop).toNumber(), y.toNumber()));

		// 顶边，连接到右上角
		path.lineTo(new this.scope.Point(x.plus(width).minus(rightTop).toNumber(), y.toNumber()));

		// 右上角弧线
		path.cubicCurveTo(
			new this.scope.Point(
				x
					.plus(width)
					.minus(rightTop.mul(new Decimal(1).minus(kappa)))
					.toNumber(),
				y.toNumber(),
			), // 控制点1
			new this.scope.Point(x.plus(width).toNumber(), y.plus(rightTop.mul(new Decimal(1).minus(kappa))).toNumber()), // 控制点2
			new this.scope.Point(x.plus(width).toNumber(), y.plus(rightTop).toNumber()), // 终点
		);

		// 右边，连接到右下角
		path.lineTo(new this.scope.Point(x.plus(width).toNumber(), y.plus(height).minus(rightBottom).toNumber()));

		// 右下角弧线
		path.cubicCurveTo(
			new this.scope.Point(
				x.plus(width).toNumber(),
				y
					.plus(height)
					.minus(rightBottom.mul(new Decimal(1).minus(kappa)))
					.toNumber(),
			),
			new this.scope.Point(
				x
					.plus(width)
					.minus(rightBottom.mul(new Decimal(1).minus(kappa)))
					.toNumber(),
				y.plus(height).toNumber(),
			),
			new this.scope.Point(x.plus(width).minus(rightBottom).toNumber(), y.plus(height).toNumber()),
		);

		// 底边，连接到左下角
		path.lineTo(new this.scope.Point(x.plus(leftBottom).toNumber(), y.plus(height).toNumber()));

		// 左下角弧线
		path.cubicCurveTo(
			new this.scope.Point(x.plus(leftBottom.mul(new Decimal(1).minus(kappa))).toNumber(), y.plus(height).toNumber()),
			new this.scope.Point(
				x.toNumber(),
				y
					.plus(height)
					.minus(leftBottom.mul(new Decimal(1).minus(kappa)))
					.toNumber(),
			),
			new this.scope.Point(x.toNumber(), y.plus(height).minus(leftBottom).toNumber()),
		);

		// 左边，连接到左上角
		path.lineTo(new this.scope.Point(x.toNumber(), y.plus(leftTop).toNumber()));

		// 左上角弧线
		path.cubicCurveTo(
			new this.scope.Point(x.toNumber(), y.plus(leftTop.mul(new Decimal(1).minus(kappa))).toNumber()),
			new this.scope.Point(x.plus(leftTop.mul(new Decimal(1).minus(kappa))).toNumber(), y.toNumber()),
			new this.scope.Point(x.plus(leftTop).toNumber(), y.toNumber()),
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

	// 修改矩形的圆角
	public modifyRectRadius(rectWidth: number, rectHeight: number, radii: IRadius): IRadius {
		// 转换为 Decimal
		let modifiedLeftTop = new Decimal(radii.leftTop);
		let modifiedRightTop = new Decimal(radii.rightTop);
		let modifiedRightBottom = new Decimal(radii.rightBottom);
		let modifiedLeftBottom = new Decimal(radii.leftBottom);

		const width = new Decimal(rectWidth);
		const height = new Decimal(rectHeight);

		// 计算 leftTop 是否需要约束
		const modifyLeftTop = () =>
			modifiedLeftTop.plus(modifiedLeftBottom).greaterThan(height) ||
			modifiedLeftTop.plus(modifiedRightTop).greaterThan(width);

		// 计算 rightTop 是否需要约束
		const modifyRightTop = () =>
			modifiedRightTop.plus(modifiedRightBottom).greaterThan(height) ||
			modifiedRightTop.plus(modifiedLeftTop).greaterThan(width);

		// 计算 rightBottom 是否需要约束
		const modifyRightBottom = () =>
			modifiedRightBottom.plus(modifiedRightTop).greaterThan(height) ||
			modifiedRightBottom.plus(modifiedLeftBottom).greaterThan(width);

		// 计算 leftBottom 是否需要约束
		const modifyLeftBottom = () =>
			modifiedLeftBottom.plus(modifiedRightBottom).greaterThan(width) ||
			modifiedLeftBottom.plus(modifiedLeftTop).greaterThan(height);

		// 找到需要约束的圆角
		const needConstraint = {
			leftTop: modifyLeftTop(),
			rightTop: modifyRightTop(),
			rightBottom: modifyRightBottom(),
			leftBottom: modifyLeftBottom(),
		};

		// 逐步增加圆角
		while (
			needConstraint.leftTop ||
			needConstraint.rightTop ||
			needConstraint.rightBottom ||
			needConstraint.leftBottom
		) {
			if (modifiedLeftTop.plus(modifiedLeftBottom).greaterThan(height)) {
				if (modifiedLeftTop.lessThanOrEqualTo(height.dividedBy(2))) {
					modifiedLeftBottom = height.minus(modifiedLeftTop);
				} else if (modifiedLeftBottom.lessThanOrEqualTo(height.dividedBy(2))) {
					modifiedLeftTop = height.minus(modifiedLeftBottom);
				} else {
					modifiedLeftTop = height.dividedBy(2);
					modifiedLeftBottom = height.dividedBy(2);
				}
			}

			if (modifiedLeftTop.plus(modifiedRightTop).greaterThan(width)) {
				if (modifiedLeftTop.lessThanOrEqualTo(width.dividedBy(2))) {
					modifiedRightTop = width.minus(modifiedLeftTop);
				} else if (modifiedRightTop.lessThanOrEqualTo(width.dividedBy(2))) {
					modifiedLeftTop = width.minus(modifiedRightTop);
				} else {
					modifiedLeftTop = width.dividedBy(2);
					modifiedRightTop = width.dividedBy(2);
				}
			}

			if (modifiedRightTop.plus(modifiedRightBottom).greaterThan(height)) {
				if (modifiedRightTop.lessThanOrEqualTo(height.dividedBy(2))) {
					modifiedRightBottom = height.minus(modifiedRightTop);
				} else if (modifiedRightBottom.lessThanOrEqualTo(height.dividedBy(2))) {
					modifiedRightTop = height.minus(modifiedRightBottom);
				} else {
					modifiedRightTop = height.dividedBy(2);
					modifiedRightBottom = height.dividedBy(2);
				}
			}

			if (modifiedRightBottom.plus(modifiedLeftBottom).greaterThan(width)) {
				if (modifiedRightBottom.lessThanOrEqualTo(width.dividedBy(2))) {
					modifiedLeftBottom = width.minus(modifiedRightBottom);
				} else if (modifiedLeftBottom.lessThanOrEqualTo(width.dividedBy(2))) {
					modifiedRightBottom = width.minus(modifiedLeftBottom);
				} else {
					modifiedRightBottom = width.dividedBy(2);
					modifiedLeftBottom = width.dividedBy(2);
				}
			}

			needConstraint.leftTop = modifyLeftTop();
			needConstraint.rightTop = modifyRightTop();
			needConstraint.rightBottom = modifyRightBottom();
			needConstraint.leftBottom = modifyLeftBottom();
		}

		return {
			leftTop: modifiedLeftTop.toNumber(),
			rightTop: modifiedRightTop.toNumber(),
			rightBottom: modifiedRightBottom.toNumber(),
			leftBottom: modifiedLeftBottom.toNumber(),
		};
	}

	public calculateBlockPadding(path: paper.Path, blockSize: number, blockPadding: number) {
		// 计算总周长
		const totalLength = path.length;
		// 计算切割次数(向下取整)
		const cutCount = Math.floor(totalLength / (blockSize + blockPadding));
		//  实际间隔
		const actualBlockPadding = (totalLength - cutCount * blockSize) / cutCount;

		return actualBlockPadding;
	}

	// 按固定宽度切割路径
	public splitPath(path: paper.Path, cutWidth: number) {
		const cutPoints: CutPoint[] = [];

		// 计算总周长
		const totalLength = path.length;

		// 沿路径按固定宽度采样
		for (let offset = 0; offset < totalLength; offset += cutWidth) {
			// 获取当前切割点的位置和切线方向
			const point = path.getPointAt(offset);
			const tangent = path.getTangentAt(offset);

			cutPoints.push({
				position: point,
				angle: tangent.angle, // 计算旋转角度（切线方向转换为角度）
			});
		}

		return cutPoints;
	}

	// 获取可绘制路径
	public getRectOffsetPath(
		rectX: number,
		rectY: number,
		rectWidth: number,
		rectHeight: number,
		radii: IRadius,
		offset: number,
	): paper.Path {
		const path = new this.scope.Path();

		if (radii.leftTop) {
			// 左上角
			path.moveTo([rectX, rectY]);
		} else {
			path.moveTo([rectX, rectY + offset]);
			path.lineTo([rectX + offset, rectY + offset]);
			path.lineTo([rectX + offset, rectY]);
		}

		if (radii.rightTop) {
			// 右上角
			path.lineTo([rectX + rectWidth, rectY]);
		} else {
			path.lineTo([rectX + rectWidth - offset, rectY]);
			path.lineTo([rectX + rectWidth - offset, rectY + offset]);
			path.lineTo([rectX + rectWidth, rectY + offset]);
		}

		if (radii.rightBottom) {
			// 右下角
			path.lineTo([rectX + rectWidth, rectY + rectHeight]);
		} else {
			path.lineTo([rectX + rectWidth, rectY + rectHeight - offset]);
			path.lineTo([rectX + rectWidth - offset, rectY + rectHeight - offset]);
			path.lineTo([rectX + rectWidth - offset, rectY + rectHeight]);
		}

		if (radii.leftBottom) {
			// 左下角
			path.lineTo([rectX, rectY + rectHeight]);
		} else {
			path.lineTo([rectX + offset, rectY + rectHeight]);
			path.lineTo([rectX + offset, rectY + rectHeight - offset]);
			path.lineTo([rectX, rectY + rectHeight - offset]);
		}

		// 完成路径闭合
		path.closePath();

		return path;
	}

	// 计算一个四分之一圆弧的长度
	public calculateQuarterArcLength(radius: number) {
		return (Math.PI * radius) / 2;
	}

	// 计算路径中每个线段的长度
	public calculatePathSegment(rectWidth: number, rectHeight: number, radii: IRadius) {
		return [
			this.calculateQuarterArcLength(radii.leftTop), // 左上角
			rectWidth - radii.leftTop - radii.rightTop, // 上边
			this.calculateQuarterArcLength(radii.rightTop), // 右上角
			rectHeight - radii.rightTop - radii.rightBottom, // 右边
			this.calculateQuarterArcLength(radii.rightBottom), // 右下角
			rectWidth - radii.rightBottom - radii.leftBottom, // 下边
			this.calculateQuarterArcLength(radii.leftBottom), // 左下角
			rectHeight - radii.leftBottom - radii.leftTop, // 左边
		];
	}

	// 计算路径中每个线段的长度，直线连接一个曲线时，视为一个线段
	public calculatePathSegmentLength(rectWidth: number, rectHeight: number, radii: IRadius) {
		const segmentLength = this.calculatePathSegment(rectWidth, rectHeight, radii);

		const result = segmentLength.reduce((acc: Array<number | null>, curr) => {
			if (curr === 0) {
				acc.push(null); // 使用 null 作为分隔符
			} else {
				if (!acc.length || acc[acc.length - 1] === null) {
					acc.push(curr);
				} else {
					(acc[acc.length - 1] as number) += curr;
				}
			}
			return acc;
		}, []);

		// 如果第一个和最后一个都不是 null，将它们合并
		if (result.length > 2 && result[0] !== null && result[result.length - 1] !== null) {
			(result[0] as number) += result.pop() as number;
		}

		return result.filter((item) => item !== null) as number[];
	}
}
