<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLayoutStore } from '@/stores/layout'
import { Package2Icon } from 'lucide-vue-next'

const layoutStore = useLayoutStore()
</script>

<template>
  <div class="flex h-full max-h-screen flex-col gap-2 bg-muted/40">
    <div class="flex h-[52px] box-content items-center border-b px-4 gap-2 font-semibold">
      <Package2Icon class="w-6 h-6" />
      <span>Acme Inc</span>
    </div>
    <ScrollArea class="p-2 flex-1">
      <Card
        v-for="item in layoutStore.carpetList" :key="item.id" class="p-3 cursor-pointer mb-2"
        @click="() => layoutStore.switchCarpet(item.id)"
      >
        <div class="overflow-hidden aspect-[10/3]">
          <img :src="item.assetUrl" :alt="item.name" class="h-full w-full object-contain aspect-square">
        </div>
        <div class="mt-3 text-center text-sm">
          <h3 class="font-medium leading-none">
            {{ item.name }}
          </h3>
        </div>
      </Card>
    </ScrollArea>
  </div>
</template>
