<script setup lang="ts">
import type { Size } from '@/types'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useLayoutStore } from '@/stores/layout'
import { Download, Minus, Plus } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

import { computed, ref, useTemplateRef } from 'vue'
import Container from './container.vue'

const MIN_SCALE = 0.1
const MAX_SCALE = 2
const SCALE_STEP = 0.05

const scaleMaps = [
  { label: '200%', value: 2 },
  { label: '150%', value: 1.5 },
  { label: '125%', value: 1.25 },
  { label: '100%', value: 1 },
  { label: '75%', value: 0.75 },
  { label: '50%', value: 0.5 },
]

const layoutStore = useLayoutStore()
const { activeCarpet } = storeToRefs(layoutStore)

const scale = ref(1)
const size = ref<Size>(activeCarpet.value!.defaultSize)
const canvasRef = useTemplateRef<{ exportToImage: () => void }>('canvasRef')

const scaleText = computed(() => {
  return `${Math.round(scale.value * 100)}%`
})

function setScale(num: number) {
  scale.value = num
}

function plusScale() {
  scale.value = Math.min(MAX_SCALE, scale.value + SCALE_STEP)
}

function minusScale() {
  scale.value = Math.max(MIN_SCALE, scale.value - SCALE_STEP)
}

function handleDownload() {
  canvasRef.value?.exportToImage()
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="relative flex items-center px-4 py-2 h-[52px]">
      <div class="flex-1 flex justify-center items-center">
        <NumberField v-model:model-value="size.width" class="w-32" :step="activeCarpet?.step">
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput v-model="size.width" />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
        <span class="w-10 text-center">x</span>
        <NumberField v-model:model-value="size.height" class="w-32" :step="activeCarpet?.step">
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>
      <div class="absolute flex items-center right-4 gap-2">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" :disabled="scale <= MIN_SCALE" @click="minusScale">
              <Minus class="size-4" />
              <span class="sr-only">画布缩小</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>画布缩小</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Label class="w-10 text-center cursor-pointer leading-9">{{ scaleText }}</Label>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-16">
            <DropdownMenuItem v-for="item in scaleMaps" :key="item.value" class="justify-center" @click="setScale(item.value)">
              {{ item.label }}
            </DropdownMenuItem>
            <DropdownMenuItem class="justify-center">
              适应屏幕
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" :disabled="scale >= MAX_SCALE" @click="plusScale">
              <Plus class="size-4" />
              <span class="sr-only">画布放大</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>画布放大</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" @click="handleDownload">
              <Download class="size-4" />
              <span class="sr-only">下载</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>下载</TooltipContent>
        </Tooltip>
      </div>
    </div>
    <Separator />
    <Container
      v-if="activeCarpet"
      v-model:scale="scale"
      :width="size.width"
      :height="size.height"
    >
      <component
        :is="activeCarpet.renderCanvas({ width: size.width, height: size.height })"
        :key="`${size.width}_${size.height}`"
        ref="canvasRef"
      />
    </Container>
  </div>
</template>
