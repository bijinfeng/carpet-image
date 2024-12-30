import type { CarpetData } from '../types'
import { defineStore } from 'pinia'

import { computed, ref } from 'vue'
import { DEFAULT_CARPET } from '../constants'

export const useLayoutStore = defineStore('layout', () => {
  const carpetList = ref<CarpetData[]>(DEFAULT_CARPET)
  const activeCarpetId = ref<number>(carpetList.value[0].id)

  const activeCarpet = computed(() => carpetList.value.find(it => it.id === activeCarpetId.value))

  const switchCarpet = (id: number) => activeCarpetId.value = id

  return { carpetList, activeCarpet, switchCarpet }
})
