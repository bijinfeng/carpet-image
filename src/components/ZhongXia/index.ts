import type { CarpetData } from '@/types'
import zhongxiaUrl from '@/assets/zhongxia/zhongxia.jpg'
import { h } from 'vue'
import Canvas from './Canvas.vue'

export const zhongXia: CarpetData = {
  id: 1,
  name: '仲夏',
  assetUrl: zhongxiaUrl,
  defaultSize: { width: 4779.98, height: 1219.98 },
  renderCanvas: props => h(Canvas, props),
}
