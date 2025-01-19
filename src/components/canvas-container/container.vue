<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import { storeToRefs } from 'pinia'
import {
  reactive,
  ref,
  useTemplateRef,
  watch,
} from 'vue'

const layoutStore = useLayoutStore()
const { contextState } = storeToRefs(layoutStore)

export interface CanvasProps {
  width: number
  height: number
}

const containerRef = useTemplateRef('containerRef')

const state = reactive({ offsetX: 0, offsetY: 0 })

const isDragging = ref(false)
const lastMousePos = reactive({ x: 0, y: 0 })

function updateCanvasSize() {
  if (containerRef.value) {
    const containerWidth = containerRef.value.clientWidth
    const containerHeight = containerRef.value.clientHeight
    const containerScale = 3 / 4

    const scale = Math.min(
      (containerWidth * containerScale) / contextState.value.width,
      (containerHeight * containerScale) / contextState.value.height,
      1,
    )

    const scaledWidth = contextState.value.width * scale
    const scaledHeight = contextState.value.height * scale

    contextState.value.scale = scale
    state.offsetX = (containerWidth - scaledWidth) / 2
    state.offsetY = (containerHeight - scaledHeight) / 2
  }
}

function handleWheel(event: WheelEvent) {
  event.preventDefault()
  const { deltaY, clientX, clientY } = event
  const container = containerRef.value
  if (!container)
    return

  const rect = container.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top

  const scaleFactor = 0.2
  const deltaFactor = Math.abs(deltaY) / 100 // Normalize deltaY
  const adjustedScaleFactor = scaleFactor * deltaFactor
  const newScale
    = deltaY > 0
      ? contextState.value.scale * (1 - adjustedScaleFactor)
      : contextState.value.scale * (1 + adjustedScaleFactor)

  const scaleChange = newScale - contextState.value.scale
  const newOffsetX
    = state.offsetX - (x - state.offsetX) * (scaleChange / contextState.value.scale)
  const newOffsetY
    = state.offsetY - (y - state.offsetY) * (scaleChange / contextState.value.scale)

  contextState.value.scale = Math.max(0.01, Math.min(10, newScale))
  state.offsetX = newOffsetX
  state.offsetY = newOffsetY
}

function handleMouseDown(event: MouseEvent) {
  isDragging.value = true
  lastMousePos.x = event.clientX
  lastMousePos.y = event.clientY
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value)
    return

  const dx = event.clientX - lastMousePos.x
  const dy = event.clientY - lastMousePos.y

  state.offsetX += dx
  state.offsetY += dy

  lastMousePos.x = event.clientX
  lastMousePos.y = event.clientY
}

function handleMouseUp() {
  isDragging.value = false
}

watch(
  () => [contextState.value.width, contextState.value.height],
  () => updateCanvasSize(),
  { immediate: true, flush: 'post' },
)
</script>

<template>
  <div
    ref="containerRef"
    class="flex relative flex-1 bg-muted overflow-hidden"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div class="cursor-pointer absolute" :style="{ left: `${state.offsetX}px`, top: `${state.offsetY}px` }">
      <div :style="{ zoom: contextState.scale }">
        <slot />
      </div>
    </div>
  </div>
</template>
