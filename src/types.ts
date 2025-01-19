import type { VNode } from 'vue'

export interface Size {
  width: number
  height: number
}

export interface IRadius {
  leftTop: number
  rightTop: number
  rightBottom: number
  leftBottom: number
}

export interface IContextState extends Size {
  carpetName: string
  radius: IRadius
  remark: string
  scale: number
}

export type RenderProps = IContextState

export interface CarpetData {
  id: number
  name: string
  assetUrl: string
  defaultSize: Size
  step?: number
  renderCanvas: (props: RenderProps) => VNode
}
