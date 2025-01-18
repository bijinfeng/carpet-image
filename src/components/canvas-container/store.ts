import type { CarpetData } from '@/types'
import { createInjectionState } from '@vueuse/core'
import { reactive } from 'vue'

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

const [useProvideContextStore, useContextStore] = createInjectionState((data: CarpetData) => {
  const contextState = reactive<IContextState>({
    width: data.defaultSize.width,
    height: data.defaultSize.height,
    scale: 1,
    remark: '',
    radius: {
      leftTop: 0,
      rightTop: 0,
      rightBottom: 0,
      leftBottom: 0,
    },
  })

  return { contextState }
})

export { useContextStore, useProvideContextStore }
