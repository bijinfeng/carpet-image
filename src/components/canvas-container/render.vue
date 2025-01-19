<script setup lang="ts">
import type Konva from 'konva'
import { TEXT_FONT_SIZE, TEXT_LINE_HEIGHT, TEXT_PRIMARY_COLOR } from '@/constants'
import { downloadURI, imageMagickConverter } from '@/lib/utils'
import { useLayoutStore } from '@/stores/layout'
import { storeToRefs } from 'pinia'
import { computed, useTemplateRef } from 'vue'

const layoutStore = useLayoutStore()
const { contextState } = storeToRefs(layoutStore)

const stageRef = useTemplateRef<InstanceType<typeof Konva.Stage>>('stage')

const text = computed(() => contextState.value.remark + contextState.value.carpetName)

const textConfig = computed<Konva.TextConfig>(() => ({
  text: text.value,
  x: -TEXT_LINE_HEIGHT,
  y: contextState.value.height,
  fontSize: TEXT_FONT_SIZE,
  fill: TEXT_PRIMARY_COLOR,
  rotation: -90,
  lineHeight: TEXT_LINE_HEIGHT / TEXT_FONT_SIZE,
}))

const backgroundConfig = computed<Konva.RectConfig>(() => ({
  x: -TEXT_LINE_HEIGHT,
  y: 0,
  width: contextState.value.width + TEXT_LINE_HEIGHT,
  height: contextState.value.height,
  fill: 'white',
}))

const stateConfig = computed<Konva.StageConfig>(() => ({
  width: contextState.value.width + TEXT_LINE_HEIGHT,
  height: contextState.value.height,
  offsetX: -TEXT_LINE_HEIGHT,
}))

const layerConfig = computed<Konva.LayerConfig>(() => {
  const { width, height, radius } = contextState.value
  const { leftTop, rightTop, rightBottom, leftBottom } = radius

  return {
    clipX: 0,
    clipY: 0,
    clipWidth: width,
    clipHeight: height,
    clipFunc(ctx) {
      ctx.beginPath()
      ctx.moveTo(leftTop, 0)
      ctx.lineTo(width - rightTop, 0)
      ctx.quadraticCurveTo(width, 0, width, rightTop)
      ctx.lineTo(width, height - rightBottom)
      ctx.quadraticCurveTo(width, height, width - rightBottom, height)
      ctx.lineTo(leftBottom, height)
      ctx.quadraticCurveTo(0, height, 0, height - leftBottom)
      ctx.lineTo(0, leftTop)
      ctx.quadraticCurveTo(0, 0, leftTop, 0)
      ctx.closePath()
    },
  }
})

async function exportToTiff() {
  const dataURL = stageRef.value!.getStage().toDataURL({ pixelRatio: 1 })
  const blob = await imageMagickConverter.rgbToCmyk(dataURL)
  const url = URL.createObjectURL(blob)
  downloadURI(url, `${text.value}.tif`)
  URL.revokeObjectURL(url)
}

defineExpose({ exportToImage: exportToTiff })
</script>

<template>
  <v-stage ref="stage" :config="stateConfig">
    <v-layer>
      <v-rect :config="backgroundConfig" />
      <v-text :config="textConfig" />
    </v-layer>

    <v-layer :config="layerConfig">
      <slot />
    </v-layer>
  </v-stage>
</template>
