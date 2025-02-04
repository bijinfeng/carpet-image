import type { CarpetData } from '@/types'
import textImage from '@/assets/moli/moli-text.jpg'

export const render: CarpetData['render'] = (props, scope) => {
  const { width, height } = props

  const image = new scope.Raster({
    source: textImage, // 使用导入的图片 URL
    position: scope.view.center,
  })
}
