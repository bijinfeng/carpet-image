<script setup lang="ts">
import { ref, type HTMLAttributes, useTemplateRef, watch } from "vue"
import { cn } from '@/lib/utils'

const REGEXP_NUMBER = /^-?(?:\d+|\d+\.\d+|\.\d+)(?:[eE][-+]?\d+)?$/;

interface NumberInputProps {
  label?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
  defaultValue?:  number
  modelValue?: number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<NumberInputProps>(), {
  step: 0.01,
  modelValue: 0,
  min: -Infinity,
  max: Infinity,
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: number): void
}>()

const inputRef = useTemplateRef<HTMLInputElement>('input')
const inputValue = ref<string | number>('')

const setValue = (value: number) => {
  const oldValue = inputValue.value;
  let newValue = typeof value !== 'number' ? parseFloat(value) : value;

  if (!isNaN(newValue)) {
    if (props.min <= props.max) {
      newValue = Math.min(props.max, Math.max(props.min, newValue));
    }
  }

  inputValue.value = newValue;

  if (newValue === oldValue && inputRef.value) {
    // Force to override the number in the input box (#13).
    inputRef.value.value = String(newValue);
  }

  emits('update:modelValue', newValue);
}

const change = (event: any) => {
  setValue(event.target.value);
}

const paste = (event: ClipboardEvent) => {
  const clipboardData = event.clipboardData || (window as any).clipboardData;

  if (clipboardData && !REGEXP_NUMBER.test(clipboardData.getData('text'))) {
    event.preventDefault();
  }
}

watch(() => props.modelValue, (newValue, oldValue) => {
  if (
    // Avoid triggering change event when created
    !(isNaN(newValue) && typeof oldValue === 'undefined')

    // Avoid infinite loop
    && newValue !== inputValue.value
  ) {
    setValue(newValue);
  }
}, { immediate: true })
</script>

<template>
  <input
    ref="input"
    type="number"
    inputmode="decimal"
    :placeholder="props.placeholder"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :value="inputValue"
    :class="cn(
      'flex h-7 w-full rounded-sm border border-transparent bg-muted px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      'number-input',
      props.class
    )"
    @change="change"
    @paste="paste"
  >
</template>

<style scoped lang="less">
.number-input {
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
}
</style>
