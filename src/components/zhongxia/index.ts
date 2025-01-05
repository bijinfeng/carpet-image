import type { CarpetData } from '@/types'
import zhongxiaUrl from '@/assets/zhongxia/zhong-xia.jpg'
import { h } from 'vue'
import RenderCanvas from './render.vue'

export const zhongxia: CarpetData = {
  id: 2,
  name: '仲夏',
  assetUrl: zhongxiaUrl,
  step: 49,
  defaultSize: { width: 3436, height: 879 },
  renderCanvas: props => h(RenderCanvas, props),
}
