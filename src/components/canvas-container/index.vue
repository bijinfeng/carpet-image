<script setup lang="ts">
import type { RenderProps, Size } from '@/types'
import Tooltip from '@/components/tooltip.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useLayoutStore } from '@/stores/layout'
import { Download } from 'lucide-vue-next'

import { storeToRefs } from 'pinia'
import { computed, ref, useTemplateRef } from 'vue'
import Container from './container.vue'
import FormControl from './form.vue'
import Render from './render.vue'
import ScaleControl from './scale-control.vue'

const layoutStore = useLayoutStore()
const { activeCarpet } = storeToRefs(layoutStore)

const scale = ref(1)
const typeNo = ref('')
const size = ref<Size>(activeCarpet.value!.defaultSize)
const canvasRef = useTemplateRef<{ exportToImage: () => void }>('canvasRef')

const renderText = computed(() => {
  return [typeNo.value, activeCarpet.value!.name].join('')
})

const renderProps = computed<RenderProps>(() => ({
  width: size.value.width,
  height: size.value.height,
  text: renderText.value,
}))

function handleDownload() {
  canvasRef.value?.exportToImage()
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="relative flex items-center px-4 py-2 h-[52px]">
      <Label class="leading-9 font-bold">xxx</Label>
      <div class="absolute flex items-center right-4 gap-2">
        <ScaleControl v-model:model-value="scale" />
        <Tooltip content="下载">
          <Button variant="ghost" size="icon" @click="handleDownload">
            <Download class="size-4" />
            <span class="sr-only">下载</span>
          </Button>
        </Tooltip>
      </div>
    </div>
    <Separator />
    <div class="flex flex-1">
      <Container
        v-if="activeCarpet"
        v-model:scale="scale"
        :width="size.width"
        :height="size.height"
      >
        <Render
          ref="canvasRef"
          :key="`${size.width}_${size.height}`"
          v-bind="renderProps"
        >
          <component :is="activeCarpet.renderCanvas(renderProps)" />
        </Render>
      </Container>
      <Separator orientation="vertical" />
      <FormControl />
    </div>
  </div>
</template>
