<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-vue-next';
</script>

<template>
  <div class="rounded-md border p-3">
    <div class="flex items-center mb-4 gap-1">
      <InfoIcon :size="14" />
      <span class="flex-1 text-sm">有新版本可用：v1.62.5</span>
    </div>

    <div>
    <Button class="w-full" size="sm">升级</Button>
    </div>
  </div>
</template>