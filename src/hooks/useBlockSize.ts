import type { RenderProps } from '@/types'
import { CM_TO_PX } from '@/constants'
import { calculateOptimalSquareSize } from '@/lib/utils'
import { computed } from 'vue'

export function useBlockSize(props: RenderProps, size: number, padding = 0) {
  const blockSize = computed(() => {
    const { width, height } = props
    const x = width - padding * 2
    const y = height - padding * 2

    return calculateOptimalSquareSize({ x, y, defaultSize: size, tolerance: 0.2 * CM_TO_PX, evenOdd: 'odd' })
  })

  return blockSize
}
