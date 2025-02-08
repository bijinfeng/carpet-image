import type { IRadius } from '@/types'

export interface CutPoint {
  position: paper.Point
  angle: number // 旋转角度（单位：度）
}

export class RectRadius {
  private insidePath: paper.Path | null = null
  private outsidePath: paper.Path | null = null
  private rectScope: paper.PaperScope

  constructor(scope: paper.PaperScope) {
    this.rectScope = scope
  }

  // 绘制圆角矩形
  private drawRectRadius(rectX: number, rectY: number, rectWidth: number, rectHeight: number, radii: IRadius) {
    const path = new this.rectScope.Path()

    // 计算圆角圆弧的控制点，使用建议的贝塞尔控制点比率
    const kappa = 0.552284749831

    // 起始点（左上角）
    path.moveTo(new this.rectScope.Point(rectX + radii.leftTop, rectY))

    // 顶边，连接到右上角
    path.lineTo(new this.rectScope.Point(rectX + rectWidth - radii.rightTop, rectY))

    // 右上角弧线
    path.cubicCurveTo(
      new this.rectScope.Point(rectX + rectWidth - (1 - kappa) * radii.rightTop, rectY), // 控制点1
      new this.rectScope.Point(rectX + rectWidth, rectY + (1 - kappa) * radii.rightTop), // 控制点2
      new this.rectScope.Point(rectX + rectWidth, rectY + radii.rightTop), // 终点
    )

    // 右边，连接到右下角
    path.lineTo(new this.rectScope.Point(rectX + rectWidth, rectY + rectHeight - radii.rightBottom))

    // 右下角弧线
    path.cubicCurveTo(
      new this.rectScope.Point(rectX + rectWidth, rectY + rectHeight - (1 - kappa) * radii.rightBottom),
      new this.rectScope.Point(rectX + rectWidth - (1 - kappa) * radii.rightBottom, rectY + rectHeight),
      new this.rectScope.Point(rectX + rectWidth - radii.rightBottom, rectY + rectHeight),
    )

    // 底边，连接到左下角
    path.lineTo(new this.rectScope.Point(rectX + radii.leftBottom, rectY + rectHeight))

    // 左下角弧线
    path.cubicCurveTo(
      new this.rectScope.Point(rectX + (1 - kappa) * radii.leftBottom, rectY + rectHeight),
      new this.rectScope.Point(rectX, rectY + rectHeight - (1 - kappa) * radii.leftBottom),
      new this.rectScope.Point(rectX, rectY + rectHeight - radii.leftBottom),
    )

    // 左边，连接到左上角
    path.lineTo(new this.rectScope.Point(rectX, rectY + radii.leftTop))

    // 左上角弧线
    path.cubicCurveTo(
      new this.rectScope.Point(rectX, rectY + (1 - kappa) * radii.leftTop),
      new this.rectScope.Point(rectX + (1 - kappa) * radii.leftTop, rectY),
      new this.rectScope.Point(rectX + radii.leftTop, rectY),
    )

    // 完成路径闭合
    path.closePath()

    return path
  }

  public drawRadius(width: number, height: number, strokeWidth: number, radius: IRadius) {
    if (this.insidePath)
      this.insidePath.remove()
    if (this.outsidePath)
      this.outsidePath.remove()

    this.outsidePath = this.drawRectRadius(0, 0, width, height, radius)
    const insideRadius: IRadius = {
      leftTop: Math.max(radius.leftTop - strokeWidth, 0),
      rightTop: Math.max(radius.rightTop - strokeWidth, 0),
      rightBottom: Math.max(radius.rightBottom - strokeWidth, 0),
      leftBottom: Math.max(radius.leftBottom - strokeWidth, 0),
    }
    this.insidePath = this.drawRectRadius(strokeWidth, strokeWidth, width - strokeWidth * 2, height - strokeWidth * 2, insideRadius)

    this.outsidePath.fillColor = new this.rectScope.Color('black')
    this.insidePath.fillColor = new this.rectScope.Color('white')
  }

  public splitPath(cutWidth: number) {
    if (!this.insidePath)
      return []

    const cutPoints: CutPoint[] = []

    // 计算总周长
    const totalLength = this.insidePath.length

    // 沿路径按固定宽度采样
    for (let offset = 0; offset < totalLength; offset += cutWidth) {
      // 获取当前切割点的位置和切线方向
      const point = this.insidePath.getPointAt(offset)
      const tangent = this.insidePath.getTangentAt(offset)

      cutPoints.push({
        position: point,
        angle: tangent.angle, // 计算旋转角度（切线方向转换为角度）
      })
    }

    return cutPoints
  }
}
