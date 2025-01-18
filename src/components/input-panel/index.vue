<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useVModel } from '@vueuse/core'
import { useSlots } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: string | number
  placeholder?: string
  textAlign?: 'left' | 'center' | 'right'
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

// 使用 useSlots 获取插槽对象
const slots = useSlots()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
})

const hasPrefixIcon = !!slots.prefix
const hasSuffixIcon = !!slots.suffix
</script>

<template>
  <div :class="cn('relative w-full max-w-sm items-center input-panel', props.class)">
    <Input
      v-model:model-value="modelValue"
      type="text"
      :placeholder="props.placeholder"
      :class="cn({
        'pl-7': hasPrefixIcon,
        'pr-7': hasSuffixIcon,
        'text-left': props.textAlign === 'left',
        'text-center': props.textAlign === 'center',
        'text-right': props.textAlign === 'right',
      })"
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
