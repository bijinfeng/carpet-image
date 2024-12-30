<script setup lang="ts">
import type { Size } from '@/types'
import { useElementSize } from '@vueuse/core'
import {
  computed,
  onMounted,
  reactive,
  ref,
  type StyleValue,
  useTemplateRef,
  type VNode,
  watch,
} from 'vue'

export interface CanvasState {
  scale: number
  offsetX: number
  offsetY: number
}

export interface CanvasProps {
  width: number
  height: number
  render: (props: Size) => VNode
}

const props = defineProps<CanvasProps>()

const containerRef = useTemplateRef('containerRef')
const containerSize = useElementSize(containerRef)

const canvasSize = reactive({ width: props.width, height: props.height })
const state = reactive<CanvasState>({
  scale: 1,
  offsetX: 0,
  offsetY: 0,
})

const contentStyle = computed<StyleValue>(() => ({
  transform: `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`,
  transformOrigin: '0 0',
  width: canvasSize.width,
  height: canvasSize.height,
}))

const isDragging = ref(false)
const lastMousePos = reactive({ x: 0, y: 0 })

function updateCanvasSize() {
  if (containerRef.value) {
    const containerWidth = containerSize.width.value
    const containerHeight = containerSize.height.value
    const containerScale = 3 / 4

    const scale = Math.min(
      containerWidth * containerScale / props.width,
      containerHeight * containerScale / props.height,
      1,
    )

    const scaledWidth = props.width * scale
    const scaledHeight = props.height * scale

    canvasSize.width = scaledWidth
    canvasSize.height = scaledHeight

    state.scale = scale
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
  const newScale = deltaY > 0
    ? state.scale * (1 - adjustedScaleFactor)
    : state.scale * (1 + adjustedScaleFactor)

  const scaleChange = newScale - state.scale
  const newOffsetX = state.offsetX - (x - state.offsetX) * (scaleChange / state.scale)
  const newOffsetY = state.offsetY - (y - state.offsetY) * (scaleChange / state.scale)

  state.scale = Math.max(0.01, Math.min(10, newScale))
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

onMounted(() => {
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
})

watch(
  () => [props.width, props.height],
  () => {
    updateCanvasSize()
  },
)
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-1 flex-col bg-muted/40 overflow-hidden"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div class="cursor-pointer" :style="contentStyle">
      <component :is="props.render({ width: props.width, height: props.height })" />
    </div>
  </div>
</template>
