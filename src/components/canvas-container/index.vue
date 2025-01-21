<script setup lang="ts">
import Tooltip from '@/components/tooltip.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useLayoutStore } from '@/stores/layout'
import { Download } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

import { computed, useTemplateRef } from 'vue'
import Container from './container.vue'
import FormControl from './form.vue'
import Render from './render.vue'
import ScaleControl from './scale-control.vue'

const layoutStore = useLayoutStore()
const { contextState, activeCarpet } = storeToRefs(layoutStore)

const canvasRef = useTemplateRef<{ exportToImage: () => void }>('canvasRef')

const rendeKey = computed(() => {
  return [contextState.value.width, contextState.value.height].concat(Object.values(contextState.value.radius)).join('_')
})

function handleDownload() {
  canvasRef.value?.exportToImage()
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="relative flex items-center px-4 py-2 h-[52px]">
      <Label class="leading-9 font-bold">{{ contextState.carpetName }}</Label>
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
        <Render ref="canvasRef" :key="rendeKey">
          <component :is="activeCarpet.renderCanvas(contextState)" />
        </Render>
      </Container>
      <Separator orientation="vertical" />
      <FormControl />
    </div>
  </div>
</template>
