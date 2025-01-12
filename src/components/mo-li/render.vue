<script setup lang="ts">
import type { RenderProps } from '@/types'
import type Konva from 'konva'
import textImage from '@/assets/moli/moli-text.jpg'
import { useBlockSize } from '@/hooks'
import { useImage } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<RenderProps>()
const IMAGE_WIDTH = 1511
const IMAGE_HEIGHT = 123
const BLOCK_SIZE = 60
const BLOCK_PADDING = 30

const { state } = useImage({ src: textImage })

const blockSize = useBlockSize(props, BLOCK_SIZE, BLOCK_PADDING)

const configRect = computed<Konva.RectConfig>(() => {
  return {
    x: BLOCK_PADDING / 2,
    y: BLOCK_PADDING / 2,
    width: props.width - BLOCK_PADDING,
    height: props.height - BLOCK_PADDING,
    stroke: 'black',
    strokeWidth: BLOCK_PADDING,
    fill: 'white',
  }
})

const configImage = computed<Konva.ImageConfig>(() => ({
  x: (props.width - IMAGE_WIDTH) / 2,
  y: (props.height - IMAGE_HEIGHT) / 2,
  width: IMAGE_WIDTH,
  height: IMAGE_HEIGHT,
  image: state.value,
}))

// 生成 blocks
const configBlocks = computed<Konva.RectConfig[]>(() => {
  const blocks: Konva.RectConfig[] = []
  const commonBlock: Konva.RectConfig = {
    x: BLOCK_PADDING,
    y: BLOCK_PADDING,
    width: blockSize.value,
    height: blockSize.value,
    fill: 'balck',
  }

  const maxWidth = props.width - BLOCK_PADDING * 2
  const maxHeight = props.height - BLOCK_PADDING * 2
  const horizontalBlockCount = Math.floor(maxWidth / blockSize.value)
  const verticalBlockCount = Math.floor(maxHeight / blockSize.value)

  for (let i = 0; i < horizontalBlockCount; i++) {
    // 是否是复数
    const isReverse = i % 2 === 0
    blocks.push(...[
      { ...commonBlock, x: BLOCK_PADDING + i * blockSize.value, y: isReverse ? BLOCK_PADDING : BLOCK_PADDING + blockSize.value },
      { ...commonBlock, x: BLOCK_PADDING + i * blockSize.value, y: isReverse ? props.height - BLOCK_PADDING - blockSize.value : props.height - BLOCK_PADDING - blockSize.value * 2 },
    ])
  }

  for (let i = 0; i < verticalBlockCount; i++) {
    // 是否是复数
    const isReverse = i % 2 === 0
    blocks.push(...[
      { ...commonBlock, x: isReverse ? BLOCK_PADDING : BLOCK_PADDING + blockSize.value, y: BLOCK_PADDING + blockSize.value * i },
      { ...commonBlock, x: isReverse ? props.width - BLOCK_PADDING - blockSize.value : props.width - BLOCK_PADDING - blockSize.value * 2, y: BLOCK_PADDING + blockSize.value * i },
    ])
  }

  return blocks
})
</script>

<template>
  <v-rect :config="configRect" />
  <v-rect v-for="(item, idx) in configBlocks" :key="idx" :config="item" />
  <v-image :config="configImage" />
</template>
