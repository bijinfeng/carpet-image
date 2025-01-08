<script setup lang="ts">
import type { RenderProps } from '@/types'
import type Konva from 'konva'
import { TEXT_FONT_SIZE, TEXT_LINE_HEIGHT, TEXT_PRIMARY_COLOR } from '@/constants'
import { downloadURI } from '@/lib/utils'
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

function exportToImage() {
  const dataURL = stageRef.value!.getStage().toDataURL({ pixelRatio: 1 })
  downloadURI(dataURL, `${props.text}.jpg`)
}

defineExpose({ exportToImage })
</script>

<template>
  <v-stage ref="stage" :config="stateConfig">
    <v-layer>
      <v-rect :config="backgroundConfig" />
      <v-text :config="textConfig" />
      <slot />
    </v-layer>
  </v-stage>
</template>
