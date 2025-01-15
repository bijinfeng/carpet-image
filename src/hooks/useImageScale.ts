import type { RenderProps } from '@/types'
import { CM_TO_PX } from '@/constants'
import { computed } from 'vue'

export function useImageScale(props: RenderProps) {
  // 画布的宽大于 30cm 时，每超过 20 cm，图片就会变大 1.2 倍
  const imageScale = computed(() => {
    const height = props.height / CM_TO_PX
    if (height <= 30)
      return 1

    return 1 + Math.ceil((height - 30) / 20) * 0.2
  })

  return imageScale
}
