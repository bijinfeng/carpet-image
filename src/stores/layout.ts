import type { CarpetData, IContextState } from '@/types'
import { moli } from '@/components/moli'
import { zhongxia } from '@/components/zhongxia'

import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

function createContextState(data: CarpetData): IContextState {
  return {
    carpetName: data.name,
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
  }
}

export const useLayoutStore = defineStore('layout', () => {
  const carpetList = ref<CarpetData[]>([moli, zhongxia])
  const activeCarpetId = ref<number>(carpetList.value[0].id)
  const activeCarpet = ref<CarpetData>(carpetList.value[0])
  const contextState = reactive(createContextState(carpetList.value[0]))

  const switchCarpet = (item: CarpetData) => {
    activeCarpetId.value = item.id
    activeCarpet.value = item
    Object.assign(contextState, createContextState(item))
  }

  return { carpetList, activeCarpet, activeCarpetId, contextState, switchCarpet }
})
