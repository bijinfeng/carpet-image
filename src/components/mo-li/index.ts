import type { CarpetData } from '@/types'
import moliUrl from '@/assets/moli/moli.jpg'
import { h } from 'vue'
import RenderCanvas from './render.vue'

export const moli: CarpetData = {
  id: 1,
  name: '墨离',
  assetUrl: moliUrl,
  step: 76,
  defaultSize: { width: 4712, height: 1216 },
  renderCanvas: props => h(RenderCanvas, props),
}
