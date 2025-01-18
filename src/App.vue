<script setup lang="ts">
import CanvasContainer from '@/components/canvas-container/index.vue'

import NavList from '@/components/nav-list.vue'
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
  defaultLayout: () => [15, 85],
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
        :min-size="10"
        :max-size="15"
      >
        <NavList />
      </ResizablePanel>
      <ResizableHandle id="resize-handle-1" with-handle />
      <ResizablePanel
        id="resize-panel-2"
        :default-size="defaultLayout[1]"
      >
        <CanvasContainer :key="layoutStore.activeCarpetId" />
      </ResizablePanel>
    </ResizablePanelGroup>
  </TooltipProvider>
</template>
