<script setup lang="ts">
import Tooltip from '@/components/tooltip.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { useLayoutStore } from '@/stores/layout'
import { Minus, Plus } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

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
const { contextState } = storeToRefs(layoutStore)

const scaleText = computed(() => {
  return `${Math.round(contextState.value.scale * 100)}%`
})

function setScale(num: number) {
  contextState.value.scale = num
}

function plusScale() {
  contextState.value.scale = Math.min(MAX_SCALE, contextState.value.scale + SCALE_STEP)
}

function minusScale() {
  contextState.value.scale = Math.max(MIN_SCALE, contextState.value.scale - SCALE_STEP)
}
</script>

<template>
  <Tooltip content="画布缩小">
    <Button
      variant="ghost"
      size="icon"
      :disabled="contextState.scale <= MIN_SCALE"
      @click="minusScale"
    >
      <Minus class="size-4" />
    </Button>
  </Tooltip>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Label class="w-10 text-center cursor-pointer leading-9">
        {{ scaleText }}
      </Label>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-16">
      <DropdownMenuItem
        v-for="item in scaleMaps"
        :key="item.value"
        class="justify-center"
        @click="setScale(item.value)"
      >
        {{ item.label }}
      </DropdownMenuItem>
      <DropdownMenuItem class="justify-center">
        适应屏幕
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <Tooltip content="画布放大">
    <Button
      variant="ghost"
      size="icon"
      :disabled="contextState.scale >= MAX_SCALE"
      @click="plusScale"
    >
      <Plus class="size-4" />
      <span class="sr-only">画布放大</span>
    </Button>
  </Tooltip>
</template>
