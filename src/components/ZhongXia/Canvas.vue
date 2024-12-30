<script setup lang="ts">
import type { Size } from '@/types'

const props = defineProps<Size>()
</script>

<template>
  <div :style="{ width: `${props.width}px`, height: `${props.height}px` }" class="inline-block bg-red-50">
    xxxx
  </div>
</template>
