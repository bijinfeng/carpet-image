<script setup lang="ts">
import type { Size } from '@/types'
import type Konva from 'konva'
import textImage from '@/assets/moli/moli-text.jpg'
import { downloadURI } from '@/lib/utils'
import { useImage } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'

const props = defineProps<Size>()
const IMAGE_WIDTH = 1511
const IMAGE_HEIGHT = 123
const BLOCK_SIZE = 60
const BLOCK_PADDING = 57

const stageRef = useTemplateRef<InstanceType<typeof Konva.Stage>>('stage')
const { state } = useImage({ src: textImage })

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
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    fill: 'balck',
  }

  const maxWidth = props.width - BLOCK_PADDING
  const maxHeight = props.height - BLOCK_PADDING
  const horizontalBlockCount = Math.floor(maxWidth / BLOCK_SIZE)
  const verticalBlockCount = Math.floor(maxHeight / BLOCK_SIZE)

  for (let i = 0; i < horizontalBlockCount; i++) {
    // 是否是复数
    const isReverse = i % 2 === 0
    blocks.push(...[
      { ...commonBlock, x: BLOCK_PADDING + i * BLOCK_SIZE, y: isReverse ? BLOCK_PADDING : BLOCK_PADDING + BLOCK_SIZE },
      { ...commonBlock, x: BLOCK_PADDING + i * BLOCK_SIZE, y: isReverse ? maxHeight - BLOCK_SIZE : maxHeight - BLOCK_SIZE * 2 },
    ])
  }

  for (let i = 0; i < verticalBlockCount; i++) {
    // 是否是复数
    const isReverse = i % 2 === 0
    blocks.push(...[
      { ...commonBlock, x: isReverse ? BLOCK_PADDING : BLOCK_PADDING + BLOCK_SIZE, y: BLOCK_PADDING + BLOCK_SIZE * i },
      { ...commonBlock, x: isReverse ? maxWidth - BLOCK_SIZE : maxWidth - BLOCK_SIZE * 2, y: BLOCK_PADDING + BLOCK_SIZE * i },
    ])
  }

  return blocks
})

function exportToImage() {
  const dataURL = stageRef.value!.getStage().toDataURL({ pixelRatio: 1 })
  downloadURI(dataURL, 'stage.png')
}

defineExpose({ exportToImage })
</script>

<template>
  <v-stage ref="stage" :config="{ width: props.width, height: props.height }">
    <v-layer>
      <v-rect :config="configRect" />
      <v-rect v-for="(item, idx) in configBlocks" :key="idx" :config="item" />
      <v-image :config="configImage" />
    </v-layer>
  </v-stage>
</template>
