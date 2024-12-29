<script setup lang="ts">
import Canvas from '@/components/Canvas/index.vue'

import Nav from '@/components/Nav.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ref } from 'vue'

interface LayoutProps {
  defaultLayout?: number[]
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

const props = withDefaults(defineProps<LayoutProps>(), {
  defaultCollapsed: false,
  defaultLayout: () => [265, 440],
})

const isCollapsed = ref(props.defaultCollapsed)

function onCollapse() {
  isCollapsed.value = true
}

function onExpand() {
  isCollapsed.value = false
}
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <ResizablePanelGroup id="resize-panel-group-1" direction="horizontal" class="!h-screen items-stretch">
      <ResizablePanel
        id="resize-panel-1" :default-size="defaultLayout[0]" :collapsed-size="navCollapsedSize"
        collapsible :min-size="15" :max-size="20"
        :class="cn(isCollapsed && 'min-w-48 transition-all duration-300 ease-in-out')" @expand="onExpand"
        @collapse="onCollapse"
      >
        <Nav />
      </ResizablePanel>
      <ResizableHandle id="resize-handle-1" with-handle />
      <ResizablePanel id="resize-panel-2" :default-size="defaultLayout[1]" :min-size="30">
        <Canvas />
      </ResizablePanel>
    </ResizablePanelGroup>
  </TooltipProvider>
</template>
