import type { CarpetData } from '../types'
import { moli } from '@/components/mo-li'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  const carpetList = ref<CarpetData[]>([moli])
  const activeCarpetId = ref<number>(carpetList.value[0].id)

  const activeCarpet = computed(() => carpetList.value.find(it => it.id === activeCarpetId.value))

  const switchCarpet = (id: number) => activeCarpetId.value = id

  return { carpetList, activeCarpet, activeCarpetId, switchCarpet }
})
