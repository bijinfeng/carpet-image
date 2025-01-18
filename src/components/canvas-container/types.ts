import type { InjectionKey } from 'vue'

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

export const contextKey = Symbol('canvas-context') as InjectionKey<IContextState>
