<script setup lang="ts">
import { Button } from '@/components/ui/button'

import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLayoutStore } from '@/stores/layout'
import { Download } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import Content from './Content.vue'

const layoutStore = useLayoutStore()
const { activeCarpet } = storeToRefs(layoutStore)
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center p-2">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="ghost" size="icon">
            <Download class="size-4" />
            <span class="sr-only">下载</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>下载</TooltipContent>
      </Tooltip>
    </div>
    <Separator />
    <div class="flex flex-1 flex-col bg-muted/40">
      <Content v-if="activeCarpet" :width="activeCarpet.defaultSize.width" :height="activeCarpet.defaultSize.height" />
    </div>
  </div>
</template>
