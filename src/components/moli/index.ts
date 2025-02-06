import type { CarpetData } from '@/types'
import moliUrl from '@/assets/moli/moli.webp'
import { render } from './render'

export const moli: CarpetData = {
  id: 1,
  name: '墨语',
  assetUrl: moliUrl,
  step: 0.1,
  defaultSize: { width: 6814, height: 1614 },
  render,
}
