<script setup lang="ts">
import Canvas from '@/components/Canvas/index.vue'

import Nav from '@/components/Nav.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useLayoutStore } from '@/stores/layout'

interface LayoutProps {
  defaultLayout?: number[]
}

withDefaults(defineProps<LayoutProps>(), {
  defaultLayout: () => [20, 80],
})

const layoutStore = useLayoutStore()
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <ResizablePanelGroup
      id="resize-panel-group-1"
      direction="horizontal"
      class="!h-screen items-stretch"
    >
      <ResizablePanel
        id="resize-panel-1"
        :default-size="defaultLayout[0]"
        :min-size="15"
        :max-size="20"
      >
        <Nav />
      </ResizablePanel>
      <ResizableHandle id="resize-handle-1" with-handle />
      <ResizablePanel
        id="resize-panel-2"
        :default-size="defaultLayout[1]"
      >
        <Canvas :key="layoutStore.activeCarpetId" />
      </ResizablePanel>
    </ResizablePanelGroup>
  </TooltipProvider>
</template>
