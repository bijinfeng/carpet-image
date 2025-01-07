import type { VNode } from 'vue'

export interface Size {
  width: number
  height: number
}

export interface RenderProps extends Size {
  type: string
}

export interface CarpetData {
  id: number
  name: string
  assetUrl: string
  defaultSize: Size
  step?: number
  renderCanvas: (props: RenderProps) => VNode
}
