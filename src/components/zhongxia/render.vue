<script setup lang="ts">
import type { RenderProps } from '@/types'
import type Konva from 'konva'
import blackWheatear from '@/assets/zhongxia/black-wheatear.svg'
import lbFlower from '@/assets/zhongxia/lbhua.svg'
import rtFlower from '@/assets/zhongxia/rthua.svg'
import whiteWheatear from '@/assets/zhongxia/white-wheatear.svg'
import textImage from '@/assets/zhongxia/zhongxia-text.svg'
import { downloadURI } from '@/lib/utils'
import { useImage } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'

const props = defineProps<RenderProps>()
const IMAGE_WIDTH = 765
const IMAGE_HEIGHT = 180
const IMAGE_RTFLOWER_WIDTH = 531
const IMAGE_RTFLOWER_HEIGHT = 339
const IMAGE_LBFLOWER_WIDTH = 542
const IMAGE_LBFLOWER_HEIGHT = 437
const BLOCK_SIZE = 39
const BLOCK_PADDING = 10
const RECT_SIZE = 60
const SPACE_WIDTH = 100
const TEXT_FONT_SIZE = 50

const stageRef = useTemplateRef<InstanceType<typeof Konva.Stage>>('stage')
const { state } = useImage({ src: textImage })
const { state: rtFlowerState } = useImage({ src: rtFlower })
const { state: lbFlowerState } = useImage({ src: lbFlower })
const { state: whiteWheatearState } = useImage({ src: whiteWheatear })
const { state: blackWheatearState } = useImage({ src: blackWheatear })

const configRect = computed<Konva.RectConfig>(() => {
  return {
    x: RECT_SIZE / 2,
    y: RECT_SIZE / 2,
    width: props.width - RECT_SIZE,
    height: props.height - RECT_SIZE,
    stroke: 'black',
    strokeWidth: RECT_SIZE,
    // fill: 'white',
  }
})

const configImage = computed<Konva.ImageConfig>(() => ({
  x: (props.width - IMAGE_WIDTH) / 2,
  y: (props.height - IMAGE_HEIGHT) / 2,
  width: IMAGE_WIDTH,
  height: IMAGE_HEIGHT,
  image: state.value,
}))

const textConfig = computed<Konva.TextConfig>(() => ({
  text: props.type,
  x: -SPACE_WIDTH,
  y: props.height,
  fontSize: TEXT_FONT_SIZE,
  fill: 'red',
  rotation: -90,
  lineHeight: SPACE_WIDTH / TEXT_FONT_SIZE,
}))

const backgroundConfig = computed<Konva.RectConfig>(() => ({
  x: 0,
  y: 0,
  width: props.width,
  height: props.height,
  fill: 'white',
}))

const configImageRtFlower = computed<Konva.ImageConfig>(() => ({
  x: props.width - IMAGE_RTFLOWER_WIDTH,
  y: 21,
  width: IMAGE_RTFLOWER_WIDTH,
  height: IMAGE_RTFLOWER_HEIGHT,
  image: rtFlowerState.value,
}))

const configImageLbFlower = computed<Konva.ImageConfig>(() => ({
  x: -14,
  y: props.height - IMAGE_LBFLOWER_HEIGHT,
  width: IMAGE_LBFLOWER_WIDTH,
  height: IMAGE_LBFLOWER_HEIGHT,
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

function exportToImage() {
  const dataURL = stageRef.value!.getStage().toDataURL({ pixelRatio: 1 })
  downloadURI(dataURL, 'stage.png')
}

defineExpose({ exportToImage })
</script>

<template>
  <v-stage ref="stage" :config="{ width: props.width + SPACE_WIDTH, height: props.height, offsetX: -SPACE_WIDTH }">
    <v-layer>
      <v-rect :config="backgroundConfig" />
      <v-text
        :config="textConfig"
      />
      <v-image :config="configImage" />
      <v-image :config="configImageRtFlower" />
      <v-image :config="configImageLbFlower" />
      <v-rect :config="configRect" />

      <v-image v-for="(item, idx) in configBlocks" :key="idx" :config="item" />
    </v-layer>
  </v-stage>
</template>
