import type { RenderProps } from '@/types'
import type Konva from 'konva'
import { computed } from 'vue'

export function useShapeConfig(props: RenderProps, padding: number) {
  const shapeConfig = computed<Konva.ShapeConfig>(() => {
    const { radius } = props

    return {
      x: padding / 2,
      y: padding / 2,
      width: props.width - padding,
      height: props.height - padding,
      stroke: 'black',
      strokeWidth: padding,
      // fill: 'white',
      sceneFunc(ctx, shape) {
        ctx.beginPath()
        // 创建路径
        ctx.moveTo(radius.leftTop, 0)
        ctx.lineTo(shape.width() - radius.rightTop, 0)
        ctx.quadraticCurveTo(shape.width(), 0, shape.width(), radius.rightTop)
        ctx.lineTo(shape.width(), shape.height() - radius.rightBottom)
        ctx.quadraticCurveTo(shape.width(), shape.height(), shape.width() - radius.rightBottom, shape.height())
        ctx.lineTo(radius.leftBottom, shape.height())
        ctx.quadraticCurveTo(0, shape.height(), 0, shape.height() - radius.leftBottom)
        ctx.lineTo(0, radius.leftTop)
        ctx.quadraticCurveTo(0, 0, radius.leftTop, 0)
        ctx.closePath()

        // 填充颜色或描边
        ctx.fillStrokeShape(shape)
      },
    }
  })

  return shapeConfig
}
