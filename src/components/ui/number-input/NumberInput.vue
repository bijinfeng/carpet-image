<script setup lang="ts">
import { cn } from '@/lib/utils';
import { type HTMLAttributes, ref, useTemplateRef, watch } from 'vue';

const REGEXP_NUMBER = /^-?(?:\d+|\d+\.\d+|\.\d+)(?:[eE][-+]?\d+)?$/;

interface NumberInputProps {
	label?: string;
	min?: number;
	max?: number;
	step?: number;
	placeholder?: string;
	defaultValue?: number;
	modelValue?: number;
	class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<NumberInputProps>(), {
	step: 0.01,
	modelValue: 0,
	min: Number.NEGATIVE_INFINITY,
	max: Number.POSITIVE_INFINITY,
});

const emits = defineEmits<(e: 'update:modelValue', payload: number) => void>();

// 处理输入框的值
const formatValue = (value: number) => {
	let newValue = typeof value !== 'number' ? Number.parseFloat(value) : value;

	if (!Number.isNaN(newValue)) {
		if (props.min <= props.max) {
			newValue = Math.min(props.max, Math.max(props.min, newValue));
		}
	}

	return newValue;
};

const inputRef = useTemplateRef<HTMLInputElement>('input');
const inputValue = ref<string | number>(formatValue(props.modelValue));

const setValue = (value: number) => {
	const oldValue = inputValue.value;
	const newValue = formatValue(value);

	inputValue.value = newValue;

	if (newValue === oldValue && inputRef.value) {
		// Force to override the number in the input box (#13).
		inputRef.value.value = String(newValue);
	}

	emits('update:modelValue', newValue);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const change = (event: any) => setValue(event.target.value);

const paste = (event: ClipboardEvent) => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const clipboardData = event.clipboardData || (window as any).clipboardData;

	if (clipboardData && !REGEXP_NUMBER.test(clipboardData.getData('text'))) {
		event.preventDefault();
	}
};

watch(
	() => props.modelValue,
	(newValue, oldValue) => {
		if (
			// Avoid triggering change event when created
			!(Number.isNaN(newValue) && typeof oldValue === 'undefined') &&
			// Avoid infinite loop
			newValue !== inputValue.value
		) {
			setValue(newValue);
		}
	},
);
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
