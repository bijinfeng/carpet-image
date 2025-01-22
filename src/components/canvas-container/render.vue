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

async function exportToTiff() {
  const dataURL = stageRef.value!.getStage().toDataURL({ pixelRatio: 1 })
  const blob = await imageMagickConverter.rgbToCmyk(dataURL)
  const url = URL.createObjectURL(blob)
  downloadURI(url, `${text.value}.jpg`)
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

    <v-layer>
      <slot />
    </v-layer>
  </v-stage>
</template>
