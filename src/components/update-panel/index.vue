<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { updateEvent } from '@/helper/aptabase';
import { set, useFetch, useIntervalFn } from '@vueuse/core';
import { InfoIcon } from 'lucide-vue-next';
import { onUnmounted, ref } from 'vue';

import { version } from '../../../package.json';

const ONE_HOUR = 30 * 60 * 1000; // 1小时（毫秒）

const createFetchUrl = () => `/version.json?t=${Date.now()}`;

const url = ref(createFetchUrl());
const couldUpdate = ref(false);

const { pause } = useIntervalFn(() => set(url, createFetchUrl()), ONE_HOUR);
const { data, onFetchResponse } = useFetch<{ version: string }>(url, { refetch: true }).get().json();

onFetchResponse(() => {
	if (data.value?.version !== version) {
		couldUpdate.value = true;
		pause();
	}
});

const forceReload = () => {
	location.reload();
	updateEvent(data.value?.version);
};

onUnmounted(pause);
</script>

<template>
  <div class="rounded-md border p-3" v-if="couldUpdate">
    <div class="flex items-center mb-4 gap-1">
      <InfoIcon :size="14" />
      <span class="flex-1 text-sm">有新版本可用：v{{ data?.version }}</span>
    </div>

    <Button class="w-full" size="sm" @click="forceReload">升级</Button>
  </div>
</template>