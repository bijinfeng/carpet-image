<script setup lang="ts">
import CanvasContainer from '@/components/canvas-container/index.vue'
import NavList from '@/components/nav-list.vue'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'

interface LayoutProps {
  defaultLayout?: number[]
}

withDefaults(defineProps<LayoutProps>(), {
  defaultLayout: () => [15, 85],
})
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <div class="flex h-screen">
      <NavList class="w-56" />
      <Separator orientation="vertical" />
      <CanvasContainer class="flex-1" />
    </div>
  </TooltipProvider>
</template>
