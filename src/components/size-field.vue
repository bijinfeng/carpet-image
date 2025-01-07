<script lang="ts" setup>
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field'
import { computed } from 'vue'

const props = defineProps<{ step?: number }>()

const state = defineModel<number>({ default: 0 })

const value = computed(() => state.value / 28.34645669)

function handleChange(num: number) {
  state.value = num * 28.34645669
}
</script>

<template>
  <NumberField :model-value="value" class="w-32" :step="props?.step" @update:model-value="handleChange">
    <NumberFieldContent>
      <NumberFieldDecrement />
      <NumberFieldInput :model-value="value" @update:model-value="handleChange" />
      <NumberFieldIncrement />
    </NumberFieldContent>
  </NumberField>
</template>
