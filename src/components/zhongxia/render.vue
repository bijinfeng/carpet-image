<script setup lang="ts">
import type { RenderProps } from '@/types'
import type Konva from 'konva'
import blackWheatear from '@/assets/zhongxia/black-wheatear.svg?url'
import lbFlower from '@/assets/zhongxia/lbhua.svg?url'
import rtFlower from '@/assets/zhongxia/rthua.svg?url'
import whiteWheatear from '@/assets/zhongxia/white-wheatear.svg?url'
import textImage from '@/assets/zhongxia/zhongxia-text.svg?url'
import { useImageScale, useShapeConfig } from '@/hooks'
import { useImage } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<RenderProps>()

// 文字图片
const IMAGE_WIDTH = 765
const IMAGE_HEIGHT = 180
// 右上角花朵图片
const IMAGE_RTFLOWER_WIDTH = 531
const IMAGE_RTFLOWER_HEIGHT = 339
// 左下角花朵图片
const IMAGE_LBFLOWER_WIDTH = 542
const IMAGE_LBFLOWER_HEIGHT = 437
const BLOCK_SIZE = 39
const BLOCK_PADDING = 10
const RECT_SIZE = 60

const { state } = useImage({ src: textImage })
const { state: rtFlowerState } = useImage({ src: rtFlower })
const { state: lbFlowerState } = useImage({ src: lbFlower })
const { state: whiteWheatearState } = useImage({ src: whiteWheatear })
const { state: blackWheatearState } = useImage({ src: blackWheatear })

const imageScale = useImageScale(props)

const shapeConfig = useShapeConfig(props, RECT_SIZE)

const configImage = computed<Konva.ImageConfig>(() => ({
  x: (props.width - IMAGE_WIDTH * imageScale.value) / 2,
  y: (props.height - IMAGE_HEIGHT * imageScale.value) / 2,
  width: IMAGE_WIDTH * imageScale.value,
  height: IMAGE_HEIGHT * imageScale.value,
  image: state.value,
}))

const configImageRtFlower = computed<Konva.ImageConfig>(() => ({
  x: props.width - IMAGE_RTFLOWER_WIDTH * imageScale.value,
  y: 21,
  width: IMAGE_RTFLOWER_WIDTH * imageScale.value,
  height: IMAGE_RTFLOWER_HEIGHT * imageScale.value,
  image: rtFlowerState.value,
}))

const configImageLbFlower = computed<Konva.ImageConfig>(() => ({
  x: -14,
  y: props.height - IMAGE_LBFLOWER_HEIGHT * imageScale.value,
  width: IMAGE_LBFLOWER_WIDTH * imageScale.value,
  height: IMAGE_LBFLOWER_HEIGHT * imageScale.value,
  image: lbFlowerState.value,
}))

// 生成 blocks
const configBlocks = computed<Konva.ImageConfig[]>(() => {
  const blocks: Konva.ImageConfig[] = []
  const commonBlock: Konva.ImageConfig = {
    x: RECT_SIZE,
    y: RECT_SIZE,
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    image: whiteWheatearState.value,
  }

  const maxWidth = props.width - 109 * 2
  const maxHeight = props.height - 109 * 2
  const horizontalBlockCount = Math.ceil(maxWidth / (BLOCK_SIZE + BLOCK_PADDING))
  const verticalBlockCount = Math.ceil(maxHeight / (BLOCK_SIZE + BLOCK_PADDING))

  for (let i = 0; i < horizontalBlockCount; i++) {
    blocks.push(...[
      { ...commonBlock, x: 109 + (BLOCK_SIZE + BLOCK_PADDING) * i, y: 21 },
      { ...commonBlock, x: 109 + (BLOCK_SIZE + BLOCK_PADDING) * i, y: 21 + BLOCK_SIZE, image: blackWheatearState.value },
      { ...commonBlock, x: 109 + (BLOCK_SIZE + BLOCK_PADDING) * i, y: props.height - RECT_SIZE - BLOCK_SIZE, image: blackWheatearState.value },
      { ...commonBlock, x: 109 + (BLOCK_SIZE + BLOCK_PADDING) * i, y: props.height - RECT_SIZE },
    ])
  }

  for (let i = 0; i < verticalBlockCount; i++) {
    const verticalCommonBlock: Konva.ImageConfig = {
      ...commonBlock,
      rotation: -90,
    }

    blocks.push(...[
      { ...verticalCommonBlock, x: 21, y: 109 + BLOCK_SIZE + (BLOCK_SIZE + BLOCK_PADDING) * i },
      { ...verticalCommonBlock, x: RECT_SIZE, y: 109 + BLOCK_SIZE + (BLOCK_SIZE + BLOCK_PADDING) * i, image: blackWheatearState.value },
      { ...verticalCommonBlock, x: props.width - (RECT_SIZE + BLOCK_SIZE), y: 109 + BLOCK_SIZE + (BLOCK_SIZE + BLOCK_PADDING) * i, image: blackWheatearState.value },
      { ...verticalCommonBlock, x: props.width - RECT_SIZE, y: 109 + BLOCK_SIZE + (BLOCK_SIZE + BLOCK_PADDING) * i },
    ])
  }

  return blocks
})
</script>

<template>
  <v-image :config="configImage" />
  <v-image :config="configImageRtFlower" />
  <v-image :config="configImageLbFlower" />
  <v-shape :config="shapeConfig" />

  <v-image v-for="(item, idx) in configBlocks" :key="idx" :config="item" />
</template>
