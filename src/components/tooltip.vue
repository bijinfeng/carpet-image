<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const props = defineProps<{
  disabled?: boolean
  content?: string
}>()
</script>

<template>
  <Tooltip :key="props.content" :disabled="props.disabled">
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipContent>{{ props.content }}</TooltipContent>
  </Tooltip>
</template>
