<script lang="ts" setup>
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field'
import { CM_TO_PX } from '@/constants'
import { computed } from 'vue'

const props = defineProps<{ step?: number }>()

const state = defineModel<number>({ default: 0 })

const value = computed(() => state.value / CM_TO_PX)

function handleChange(num: number) {
  state.value = num * CM_TO_PX
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
