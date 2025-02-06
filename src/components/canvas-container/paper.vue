<script lang="ts" setup>
import { TEXT_FONT_SIZE, TEXT_LINE_HEIGHT, TEXT_PRIMARY_COLOR } from '@/constants'
import { useLayoutStore } from '@/stores/layout'
import type { IRenderCarpet } from '@/types'
import paper from 'paper'
import { storeToRefs } from 'pinia'
import { computed, onMounted, useTemplateRef, watch } from 'vue'
import { downloadURI, imageMagickConverter } from '@/lib/utils'

const layoutStore = useLayoutStore()
const { contextState, activeCarpet } = storeToRefs(layoutStore)
const canvasRef = useTemplateRef<HTMLCanvasElement>('myCanvas')
const scope = new paper.PaperScope()
let contentRender: IRenderCarpet | null = null

const remarkText = computed(() => contextState.value.remark + contextState.value.carpetName)

let rectangle: paper.Path.Rectangle
let text: paper.PointText

function initPaper() {
  scope.view.viewSize.width = contextState.value.width + TEXT_LINE_HEIGHT
  scope.view.viewSize.height = contextState.value.height

  rectangle = new scope.Path.Rectangle({
    point: [-TEXT_LINE_HEIGHT, 0],
    size: [TEXT_LINE_HEIGHT, contextState.value.height],
    fillColor: 'white',
  })

  // 创建一个 PointText 对象
  text = new scope.PointText({
    point: [-TEXT_LINE_HEIGHT, contextState.value.height - 5], // 设置文字的位置
    content: remarkText.value, // 设置文字内容
    fillColor: TEXT_PRIMARY_COLOR, // 设置文字颜色
    justification: 'left', // 设置文字对齐方式
    fontSize: TEXT_FONT_SIZE, // 设置文字大小
    leading: 1,
    rotation: -90, // 设置文字旋转角度，使其垂直显示
  })

  // // 获取文字的实际高度
  const bounds = text.bounds
  text.position.y -= bounds.height / 2

  contentRender = activeCarpet.value.render(scope)
  contentRender.init(contextState.value)
}

function updatePaper() {
  if (!rectangle || !text) return

  scope.view.viewSize.width = contextState.value.width + TEXT_LINE_HEIGHT
  scope.view.viewSize.height = contextState.value.height

  rectangle.set({ size: [TEXT_LINE_HEIGHT, contextState.value.height] })
  text.content = remarkText.value

  contentRender?.update(contextState.value)
}

onMounted(() => {
  if (canvasRef.value) {
    // 初始化 paper.js 画布
    scope.setup(canvasRef.value)

    // 将画布坐标系向右平移 100px
    scope.view.matrix = new scope.Matrix().translate(TEXT_LINE_HEIGHT, 0)

    // 调用 updateCanvas 函数来添加文字
    initPaper()
  }
})

watch(() => [contextState.value.width, contextState.value.height, contextState.value.remark, contextState.value.radius], () => updatePaper(), { deep: true })

async function exportToTiff() {
  if (!canvasRef.value) return

  const dataURL = canvasRef.value.toDataURL()
  const blob = await imageMagickConverter.rgbToCmyk(dataURL)
  const url = URL.createObjectURL(blob)
  downloadURI(url, `${remarkText.value}.jpg`)
  URL.revokeObjectURL(url)
}

defineExpose({ exportToImage: exportToTiff })
</script>

<template>
  <canvas ref="myCanvas" :style="{ zoom: contextState.scale }" />
</template>
