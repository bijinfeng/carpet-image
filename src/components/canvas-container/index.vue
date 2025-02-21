<script setup lang="ts">
import Tooltip from '@/components/tooltip.vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { downloadEvent } from '@/helper/aptabase';
import { useLayoutStore } from '@/stores/layout';
import { DownloadIcon, Loader2Icon } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { ref, useTemplateRef } from 'vue';

import Container from './container.vue';
import FormControl from './form.vue';
import Paper from './paper.vue';
import type PaperInstance from './paper.vue';
import ScaleControl from './scale-control.vue';
import TempPaper from './temp-paper.vue';

type PaperType = InstanceType<typeof PaperInstance>;

const layoutStore = useLayoutStore();
const { contextState } = storeToRefs(layoutStore);
const downloading = ref(false);
const canvasRef = useTemplateRef<PaperType>('canvasRef');

async function handleDownload() {
	downloading.value = true;
	await canvasRef.value?.exportToImage();
	downloading.value = false;

	downloadEvent();
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="relative flex items-center px-4 py-2 h-[52px]">
      <Label class="leading-9 font-bold">{{ contextState.carpetName }}</Label>
      <div class="absolute flex items-center right-4 gap-2">
        <ScaleControl />
        <Tooltip content="下载">
          <Button :disabled="downloading" variant="ghost" size="icon" @click="handleDownload">
            <Loader2Icon v-if="downloading" class="animate-spin" />
            <DownloadIcon v-else class="size-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
    <Separator />
    <div class="flex flex-1">
      <TempPaper />
      <Container>
        <Paper ref="canvasRef" />
      </Container>
      <Separator orientation="vertical" />
      <FormControl />
    </div>
  </div>
</template>
