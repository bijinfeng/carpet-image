import type { IRadius } from '@/types';

export interface CutPoint {
	position: paper.Point;
	angle: number; // 旋转角度（单位：度）
}

export class RectRadius {
	constructor(public scope: paper.PaperScope) {}

	// 绘制圆角矩形
	public drawRectRadius(rectX: number, rectY: number, rectWidth: number, rectHeight: number, radii: IRadius) {
		const path = new this.scope.Path();

		// 计算圆角圆弧的控制点，使用建议的贝塞尔控制点比率
		const kappa = 0.552284749831;

		// 起始点（左上角）
		path.moveTo(new this.scope.Point(rectX + radii.leftTop, rectY));

		// 顶边，连接到右上角
		path.lineTo(new this.scope.Point(rectX + rectWidth - radii.rightTop, rectY));

		// 右上角弧线
		path.cubicCurveTo(
			new this.scope.Point(rectX + rectWidth - (1 - kappa) * radii.rightTop, rectY), // 控制点1
			new this.scope.Point(rectX + rectWidth, rectY + (1 - kappa) * radii.rightTop), // 控制点2
			new this.scope.Point(rectX + rectWidth, rectY + radii.rightTop), // 终点
		);

		// 右边，连接到右下角
		path.lineTo(new this.scope.Point(rectX + rectWidth, rectY + rectHeight - radii.rightBottom));

		// 右下角弧线
		path.cubicCurveTo(
			new this.scope.Point(rectX + rectWidth, rectY + rectHeight - (1 - kappa) * radii.rightBottom),
			new this.scope.Point(rectX + rectWidth - (1 - kappa) * radii.rightBottom, rectY + rectHeight),
			new this.scope.Point(rectX + rectWidth - radii.rightBottom, rectY + rectHeight),
		);

		// 底边，连接到左下角
		path.lineTo(new this.scope.Point(rectX + radii.leftBottom, rectY + rectHeight));

		// 左下角弧线
		path.cubicCurveTo(
			new this.scope.Point(rectX + (1 - kappa) * radii.leftBottom, rectY + rectHeight),
			new this.scope.Point(rectX, rectY + rectHeight - (1 - kappa) * radii.leftBottom),
			new this.scope.Point(rectX, rectY + rectHeight - radii.leftBottom),
		);

		// 左边，连接到左上角
		path.lineTo(new this.scope.Point(rectX, rectY + radii.leftTop));

		// 左上角弧线
		path.cubicCurveTo(
			new this.scope.Point(rectX, rectY + (1 - kappa) * radii.leftTop),
			new this.scope.Point(rectX + (1 - kappa) * radii.leftTop, rectY),
			new this.scope.Point(rectX + radii.leftTop, rectY),
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
		const leftTop = radii.leftTop;
		const rightTop = radii.rightTop;
		const rightBottom = radii.rightBottom;
		const leftBottom = radii.leftBottom;

		let modifiedLeftTop = leftTop;
		let modifiedRightTop = rightTop;
		let modifiedRightBottom = rightBottom;
		let modifiedLeftBottom = leftBottom;

		// 计算 leftTop 是否需要约束
		const modifyLeftTop = () =>
			modifiedLeftTop + modifiedLeftBottom > rectHeight || modifiedLeftTop + modifiedRightTop > rectWidth;
		// 计算 rightTop 是否需要约束
		const modifyRightTop = () =>
			modifiedRightTop + modifiedRightBottom > rectHeight || modifiedRightTop + modifiedLeftTop > rectWidth;
		// 计算 rightBottom 是否需要约束
		const modifyRightBottom = () =>
			modifiedRightBottom + modifiedRightTop > rectHeight || modifiedRightBottom + modifiedLeftBottom > rectWidth;
		// 计算 leftBottom 是否需要约束
		const modifyLeftBottom = () =>
			modifiedLeftBottom + modifiedRightBottom > rectWidth || modifiedLeftBottom + modifiedLeftTop > rectHeight;

		// 找到需要约束的圆角:如果和超出边界,则需要约束
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
			if (modifiedLeftTop + modifiedLeftBottom > rectHeight) {
				if (modifiedLeftTop <= rectHeight / 2) {
					modifiedLeftBottom = rectHeight - modifiedLeftTop;
				} else if (modifiedLeftBottom <= rectHeight / 2) {
					modifiedLeftTop = rectHeight - modifiedLeftBottom;
				} else {
					modifiedLeftTop = rectHeight / 2;
					modifiedLeftBottom = rectHeight / 2;
				}
			}

			if (modifiedLeftTop + modifiedRightTop > rectWidth) {
				if (modifiedLeftTop <= rectWidth / 2) {
					modifiedRightTop = rectWidth - modifiedLeftTop;
				} else if (modifiedRightTop <= rectWidth / 2) {
					modifiedLeftTop = rectWidth - modifiedRightTop;
				} else {
					modifiedLeftTop = rectWidth / 2;
					modifiedRightTop = rectWidth / 2;
				}
			}

			if (modifiedRightTop + modifiedRightBottom > rectHeight) {
				if (modifiedRightTop <= rectHeight / 2) {
					modifiedRightBottom = rectHeight - modifiedRightTop;
				} else if (modifiedRightBottom <= rectHeight / 2) {
					modifiedRightTop = rectHeight - modifiedRightBottom;
				} else {
					modifiedRightTop = rectHeight / 2;
					modifiedRightBottom = rectHeight / 2;
				}
			}

			if (modifiedRightTop + modifiedLeftTop > rectWidth) {
				if (modifiedRightTop <= rectWidth / 2) {
					modifiedLeftTop = rectWidth - modifiedRightTop;
				} else if (modifiedLeftTop <= rectWidth / 2) {
					modifiedRightTop = rectWidth - modifiedLeftTop;
				} else {
					modifiedRightTop = rectWidth / 2;
					modifiedLeftTop = rectWidth / 2;
				}
			}

			needConstraint.leftTop = modifyLeftTop();
			needConstraint.rightTop = modifyRightTop();
			needConstraint.rightBottom = modifyRightBottom();
			needConstraint.leftBottom = modifyLeftBottom();
		}

		return {
			leftTop: modifiedLeftTop,
			rightTop: modifiedRightTop,
			rightBottom: modifiedRightBottom,
			leftBottom: modifiedLeftBottom,
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

	// 计算路径中每个线段的长度，直线连接一个曲线时，视为一个线段
	public calculatePathSegmentLength(rectWidth: number, rectHeight: number, radii: IRadius) {
		const segmentLength = [
			this.calculateQuarterArcLength(radii.leftTop), // 左上角
			rectWidth - radii.leftTop - radii.rightTop, // 上边
			this.calculateQuarterArcLength(radii.rightTop), // 右上角
			rectHeight - radii.rightTop - radii.rightBottom, // 右边
			this.calculateQuarterArcLength(radii.rightBottom), // 右下角
			rectWidth - radii.rightBottom - radii.leftBottom, // 下边
			this.calculateQuarterArcLength(radii.leftBottom), // 左下角
			rectHeight - radii.leftBottom - radii.leftTop, // 左边
		];

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
