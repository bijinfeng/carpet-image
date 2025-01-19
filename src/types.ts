import type { VNode } from 'vue'

export interface Size {
  width: number
  height: number
}

export interface RenderProps extends Size {
  text: string
  radius?: number
}

export interface CarpetData {
  id: number
  name: string
  assetUrl: string
  defaultSize: Size
  step?: number
  renderCanvas: (props: RenderProps) => VNode
}

export interface IContextState {
  width: number
  height: number
  radius: {
    leftTop: number
    rightTop: number
    rightBottom: number
    leftBottom: number
  }
  remark: string
  scale: number
}
