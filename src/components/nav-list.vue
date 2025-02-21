<script setup lang="ts">
import LogoIcon from '@/assets/logo.svg?component';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import UpdatePanel from '@/components/update-panel/index.vue';
import { carpetList } from '@/render';
import { useLayoutStore } from '@/stores/layout';

const layoutStore = useLayoutStore();
</script>

<template>
  <div class="relative flex h-full max-h-screen flex-col">
    <div class="px-4 py-2 font-semibold">
      <div class="flex h-9 items-center gap-2">
        <LogoIcon class="w-5 h-5" />
        <span>Alchemist</span>
      </div>
    </div>
    <Separator />
    <ScrollArea class="p-2 flex-1">
      <Card
        v-for="item in carpetList"
        :key="item.id"
        class="p-3 cursor-pointer mb-2"
        @click="() => layoutStore.switchCarpet(item)"
      >
        <div class="overflow-hidden aspect-[10/3]">
          <img
            :src="item.assetUrl"
            :alt="item.name"
            class="h-full w-full object-contain aspect-square"
          >
        </div>
        <div class="mt-3 text-center text-sm">
          <h3 class="font-medium leading-none">
            {{ item.name }}
          </h3>
        </div>
      </Card>
    </ScrollArea>

    <div class="p-2">
      <UpdatePanel />
    </div>
  </div>
</template>
