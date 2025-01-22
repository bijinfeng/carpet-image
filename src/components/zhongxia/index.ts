import type { CarpetData } from '@/types'
import zhongxiaUrl from '@/assets/zhongxia/zhong-xia.webp'
import { h } from 'vue'
import RenderCanvas from './render.vue'

export const zhongxia: CarpetData = {
  id: 2,
  name: '盛夏',
  assetUrl: zhongxiaUrl,
  step: 0.1,
  defaultSize: { width: 3436, height: 879 },
  renderCanvas: props => h(RenderCanvas, props),
}
