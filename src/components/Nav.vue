<script setup lang="ts">
import zhongxiaUrl from "@/assets/zhongxia/zhongxia.jpg";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
</script>

<template>
  <ScrollArea class="p-2 h-full">
    <Card class="p-3 cursor-pointer">
      <div class="overflow-hidden">
        <img :src="zhongxiaUrl" alt="仲夏"
          class="h-20 w-full object-contain aspect-square" />
      </div>
      <div class="mt-3 text-center text-sm">
        <h3 class="font-medium leading-none">仲夏</h3>
      </div>
    </Card>
  </ScrollArea>
</template>
