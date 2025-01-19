<script setup lang="ts">
import type { RenderProps } from '@/types'
import Tooltip from '@/components/tooltip.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useLayoutStore } from '@/stores/layout'
import { Download } from 'lucide-vue-next'

import { computed, useTemplateRef } from 'vue'
import Container from './container.vue'
import FormControl from './form.vue'
import Render from './render.vue'
import ScaleControl from './scale-control.vue'

const layoutStore = useLayoutStore()

const canvasRef = useTemplateRef<{ exportToImage: () => void }>('canvasRef')

const renderText = computed(() => [layoutStore.contextState.remark, layoutStore.contextState.name].join(''))

const renderProps = computed<RenderProps>(() => ({
  width: layoutStore.contextState.width,
  height: layoutStore.contextState.height,
  text: renderText.value,
}))

function handleDownload() {
  canvasRef.value?.exportToImage()
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="relative flex items-center px-4 py-2 h-[52px]">
      <Label class="leading-9 font-bold">{{ layoutStore.contextState.name }}</Label>
      <div class="absolute flex items-center right-4 gap-2">
        <ScaleControl />
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
      <Container>
        <Render
          ref="canvasRef"
          :key="`${layoutStore.contextState.width}_${layoutStore.contextState.height}`"
          v-bind="renderProps"
        >
          <component :is="layoutStore.activeCarpet.renderCanvas(renderProps)" />
        </Render>
      </Container>
      <Separator orientation="vertical" />
      <FormControl />
    </div>
  </div>
</template>
