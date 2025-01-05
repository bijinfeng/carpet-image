<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()
</script>

<template>
  <ScrollArea class="p-2 h-full bg-muted">
    <Card v-for="item in layoutStore.carpetList" :key="item.id" class="p-3 cursor-pointer mb-2" @click="() => layoutStore.switchCarpet(item.id)">
      <div class="overflow-hidden">
        <img
          :src="item.assetUrl" :alt="item.name"
          class="h-20 w-full object-contain aspect-square"
        >
      </div>
      <div class="mt-3 text-center text-sm">
        <h3 class="font-medium leading-none">
          {{ item.name }}
        </h3>
      </div>
    </Card>
  </ScrollArea>
</template>
