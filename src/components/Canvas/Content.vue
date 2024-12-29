<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
  type StyleValue,
  useTemplateRef,
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
}

const props = defineProps<CanvasProps>()

const containerRef = useTemplateRef('containerRef')
const canvasRef = useTemplateRef('canvasRef')

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
    const { width: containerWidth, height: containerHeight }
      = containerRef.value.getBoundingClientRect()
    const scale = Math.min(
      containerWidth / props.width,
      containerHeight / props.height,
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

function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas)
    return

  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw canvas content
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, props.width, props.height)
  ctx.strokeStyle = '#000000'
  ctx.strokeRect(0, 0, props.width, props.height)

  // Example: Draw some shapes
  ctx.fillStyle = 'red'
  ctx.fillRect(50, 50, 100, 100)
  ctx.fillStyle = 'blue'
  ctx.beginPath()
  ctx.arc(300, 200, 50, 0, Math.PI * 2)
  ctx.fill()
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
  drawCanvas()
})

watch(
  () => [canvasSize.width, canvasSize.height],
  () => {
    nextTick(drawCanvas)
  },
)

watch(
  () => [props.width, props.height],
  () => {
    updateCanvasSize()
    nextTick(drawCanvas)
  },
)
</script>

<template>
  <div
    ref="containerRef"
    class="w-full h-full overflow-hidden"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div class="cursor-pointer" :style="contentStyle">
      <canvas
        ref="canvasRef"
        :width="canvasSize.width"
        :height="canvasSize.height"
      />
    </div>
  </div>
</template>
