import type { IRenderCarpet, RenderProps } from '@/types'
import lbFlower from '@/assets/zhongxia/lbhua.png'
import rtFlower from '@/assets/zhongxia/rthua.png'
import textImage from '@/assets/zhongxia/zhongxia-text.png'
import { useImageScale } from '@/hooks'
import { RectRadius } from '@/lib/rect-radius'

const BLOCK_SIZE = 39
const BLOCK_PADDING = 10
const RECT_SIZE = 60

// 文字图片
const IMAGE_WIDTH = 765
const IMAGE_HEIGHT = 180
// 右上角花朵图片
const IMAGE_RTFLOWER_WIDTH = 531
const IMAGE_RTFLOWER_HEIGHT = 339
// 左下角花朵图片
const IMAGE_LBFLOWER_WIDTH = 542
const IMAGE_LBFLOWER_HEIGHT = 437

const cutWidth = BLOCK_SIZE + BLOCK_PADDING

const wheatearData = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="39.11962890625" height="78.45852661132812" viewBox="0 0 39.11962890625 78.45852661132812" fill="none">
  <path d="M39.1197 78.4585C17.5149 78.4585 0.000976562 60.8953 0.000976562 39.2298C21.6057 39.2298 39.1197 56.793 39.1197 78.4585Z" fill="#000000">
  </path>
  <path d="M0 39.2288C21.6048 39.2288 39.1187 21.6655 39.1187 0C17.514 0 0 17.5633 0 39.2288Z" fill="#FFFFFF">
  </path>
</svg>
`

// 存储切割点信息
interface CutPoint {
  position: paper.Point;
  angle: number; // 旋转角度（单位：度）
  svgItem?: paper.Item;
}

class Render extends RectRadius implements IRenderCarpet {
  private centerText!: paper.Raster
  private wheatearItem: paper.Item | null = null

  private cutPoints: CutPoint[] = []

  constructor(private scope: paper.PaperScope) {
    super(scope)
  }
  
  private _createRect(props: RenderProps) {
    this._clearCutPoints()
    
    this.drawRadius(props.width, props.height, RECT_SIZE, props.radius)
    this.cutPoints = this.splitPath(cutWidth)

    this._drawCutPoints()
  }

  // 绘制切割点和旋转方向
  private _drawCutPoints() {
    this.cutPoints.forEach((point) => {
      if (!this.wheatearItem) {
        this.wheatearItem = this.scope.project.importSVG(wheatearData, {
          expandShapes: true,
          onLoad: (svg: paper.Item) => {
            svg.bounds.width = BLOCK_SIZE
            svg.bounds.height = BLOCK_SIZE * 2
            svg.visible = false
          }
        })
      } 

      const imgRaster = this.wheatearItem.clone()
      imgRaster.position = point.position
      imgRaster.rotate(point.angle)
      imgRaster.visible = true
      imgRaster.bringToFront()

      point.svgItem = imgRaster
    })
  }

  private _clearCutPoints() {
    this.cutPoints.forEach(({ svgItem }) => svgItem?.remove())
    this.cutPoints = []
  }

  init(props: RenderProps) {
    const imageScale = useImageScale(props)
    this._createRect(props)

    // 中间文字
    this.centerText = new this.scope.Raster({
      source: textImage, // 使用导入的图片 URL
      position: this.scope.view.center,
      size: new this.scope.Size(IMAGE_WIDTH * imageScale.value, IMAGE_HEIGHT * imageScale.value),
    })
  }

  update(props: RenderProps) {
    const imageScale = useImageScale(props)
    this._createRect(props)

    this.centerText.position = this.scope.view.center
    this.centerText.bounds.size = new this.scope.Size(IMAGE_WIDTH * imageScale.value, IMAGE_HEIGHT * imageScale.value)
  }
}

export const render = (scope: paper.PaperScope) => new Render(scope)
