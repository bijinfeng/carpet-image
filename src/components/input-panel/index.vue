<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { NumberInput } from '@/components/ui/number-input'
import { CM_TO_PX } from '@/constants'
import { cn } from '@/lib/utils'
import { round } from 'lodash-es'
import { computed, useSlots } from 'vue'

interface InputPanelProps {
  class?: HTMLAttributes['class']
  modelValue?: number
  placeholder?: string
  textAlign?: 'left' | 'center' | 'right'
  min?: number
  max?: number
}

const props = withDefaults(defineProps<InputPanelProps>(), {
  modelValue: 0,
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: number): void
}>()

// 使用 useSlots 获取插槽对象
const slots = useSlots()

const modelValue = computed(() => round(props.modelValue / CM_TO_PX, 1))

const hasPrefixIcon = !!slots.prefix
const hasSuffixIcon = !!slots.suffix

function handleChange(num: number) {
  const newValue = Math.round(num * CM_TO_PX)
  emits('update:modelValue', newValue)
}
</script>

<template>
  <div :class="cn('relative w-full max-w-sm items-center input-panel', props.class)">
    <NumberInput
      :model-value="modelValue"
      :min="props.min"
      :max="props.max"
      :placeholder="props.placeholder"
      :class="cn({
        'pl-7': hasPrefixIcon,
        'pr-7': hasSuffixIcon,
        'text-left': props.textAlign === 'left',
        'text-center': props.textAlign === 'center',
        'text-right': props.textAlign === 'right',
      })"
      @update:model-value="handleChange"
    />
    <span v-if="hasPrefixIcon" class="absolute top-0 left-0 h-full flex items-center justify-center w-7 text-muted-foreground opacity-50">
      <slot name="prefix" />
    </span>
    <span v-if="hasSuffixIcon" class="absolute top-0 right-0 h-full flex items-center justify-center w-7 text-muted-foreground opacity-50">
      <slot name="suffix" />
    </span>
  </div>
</template>

<style scoped>
.input-panel {
  grid-column-end: span 6;
}
</style>
