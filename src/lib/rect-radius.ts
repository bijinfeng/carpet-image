import type { IRadius } from "@/types";

export interface CutPoint {
  position: paper.Point;
  angle: number; // 旋转角度（单位：度）
}

export class RectRadius {
  private insidePath: paper.Path | null = null;
  private outsidePath: paper.Path | null = null;
  private rectScope: paper.PaperScope;

  
  constructor(scope: paper.PaperScope) {
    this.rectScope = scope;
  }

  // 绘制圆角矩形
  private drawRectRadius(x: number, y: number, width: number, height: number, radius: IRadius) {
    const startPoint = new this.rectScope.Point(x, y);
    const path = new this.rectScope.Path();

    // 通过移动到左上角起点，开始绘制路径
    path.moveTo(startPoint.add([radius.leftTop, 0]));

    // 绘制顶部边和右上角圆弧
    path.lineTo(startPoint.add([width - radius.rightTop, 0]));
    path.quadraticCurveTo(startPoint.add([width, 0]), startPoint.add([width, radius.rightTop]));

    // 绘制右侧边和右下角圆弧
    path.lineTo(startPoint.add([width, height - radius.rightBottom]));
    path.quadraticCurveTo(startPoint.add([width, height]), startPoint.add([width - radius.rightBottom, height]));

    // 绘制底部边和左下角圆弧
    path.lineTo(startPoint.add([radius.leftBottom, height]));
    path.quadraticCurveTo(startPoint.add([0, height]), startPoint.add([0, height - radius.leftBottom]));

    // 绘制左侧边和左上角圆弧
    path.lineTo(startPoint.add([0, radius.leftTop]));
    path.quadraticCurveTo(startPoint.add([0, 0]), startPoint.add([radius.leftTop, 0]));

    // 关闭路径以完成矩形
    path.closePath();

    return path;
  }

  public drawRadius(width: number, height: number, strokeWidth: number, radius: IRadius) {
    if (this.insidePath) this.insidePath.remove();
    if (this.outsidePath) this.outsidePath.remove();

    this.insidePath = this.drawRectRadius(strokeWidth, strokeWidth, width - strokeWidth * 2, height - strokeWidth * 2, radius);
    this.outsidePath = this.drawRectRadius(strokeWidth / 2, strokeWidth / 2, width - strokeWidth, height - strokeWidth, radius);

    this.insidePath.fillColor = new this.rectScope.Color(255, 255, 255);
    this.outsidePath.strokeColor = new this.rectScope.Color(0, 0, 0);
    this.outsidePath.strokeWidth = strokeWidth;
  }

  public splitPath(cutWidth: number) {
    if (!this.insidePath) return [];
    const cutPoints: CutPoint[] = [];

    // 计算总周长
    const totalLength = this.insidePath.length;
    console.log("圆角矩形总长度:", totalLength);

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
}
