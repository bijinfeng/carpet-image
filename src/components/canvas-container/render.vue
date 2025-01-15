<script setup lang="ts">
import type { RenderProps } from '@/types'
import type Konva from 'konva'
import { TEXT_FONT_SIZE, TEXT_LINE_HEIGHT, TEXT_PRIMARY_COLOR } from '@/constants'
import { base64ToArrayBuffer, rgbToCmyk } from '@/lib/utils'
import { computed, useTemplateRef } from 'vue'

const props = defineProps<RenderProps>()

const stageRef = useTemplateRef<InstanceType<typeof Konva.Stage>>('stage')

const textConfig = computed<Konva.TextConfig>(() => ({
  text: props.text,
  x: -TEXT_LINE_HEIGHT,
  y: props.height,
  fontSize: TEXT_FONT_SIZE,
  fill: TEXT_PRIMARY_COLOR,
  rotation: -90,
  lineHeight: TEXT_LINE_HEIGHT / TEXT_FONT_SIZE,
}))

const backgroundConfig = computed<Konva.RectConfig>(() => ({
  x: -TEXT_LINE_HEIGHT,
  y: 0,
  width: props.width + TEXT_LINE_HEIGHT,
  height: props.height,
  fill: 'white',
}))

const stateConfig = computed<Konva.StageConfig>(() => ({
  width: props.width + TEXT_LINE_HEIGHT,
  height: props.height,
  offsetX: -TEXT_LINE_HEIGHT,
}))

const layerConfig = computed<Konva.LayerConfig>(() => ({
  clipX: 0,
  clipY: 0,
  clipWidth: props.width,
  clipHeight: props.height,
  clipFunc(ctx) {
    const radius = props.radius ?? 0 // 圆角半径
    const width = props.width
    const height = props.height

    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(width - radius, 0)
    ctx.quadraticCurveTo(width, 0, width, radius)
    ctx.lineTo(width, height - radius)
    ctx.quadraticCurveTo(width, height, width - radius, height)
    ctx.lineTo(radius, height)
    ctx.quadraticCurveTo(0, height, 0, height - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
  },
}))

async function exportToTiff() {
  const dataURL = stageRef.value!.getStage().toDataURL({ pixelRatio: 1 })
  const sourceBytes = base64ToArrayBuffer(dataURL)
  const blob = await rgbToCmyk(sourceBytes)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.text}.tif`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
