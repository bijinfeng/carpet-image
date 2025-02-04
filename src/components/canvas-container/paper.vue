<script lang="ts" setup>
import { TEXT_FONT_SIZE, TEXT_LINE_HEIGHT, TEXT_PRIMARY_COLOR } from '@/constants'
import { useLayoutStore } from '@/stores/layout'
import paper from 'paper'
import { storeToRefs } from 'pinia'
import { computed, onMounted, useTemplateRef } from 'vue'

const layoutStore = useLayoutStore()
const { contextState, activeCarpet } = storeToRefs(layoutStore)
const canvasRef = useTemplateRef<HTMLCanvasElement>('myCanvas')
const scope = new paper.PaperScope()

const remarkText = computed(() => contextState.value.remark + contextState.value.carpetName)

function updateCanvas() {
  const _rect = new scope.Path.Rectangle({
    point: [-TEXT_LINE_HEIGHT, 0],
    size: [TEXT_LINE_HEIGHT, contextState.value.height],
    fillColor: 'white',
  })

  // 创建一个 PointText 对象
  const text = new scope.PointText({
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
}

onMounted(() => {
  if (canvasRef.value) {
    // 初始化 paper.js 画布
    scope.setup(canvasRef.value)
    scope.view.viewSize.width = contextState.value.width
    scope.view.viewSize.height = contextState.value.height

    // 将画布坐标系向右平移 100px
    scope.view.matrix = new scope.Matrix().translate(TEXT_LINE_HEIGHT, 0)
    // 调用 updateCanvas 函数来添加文字
    updateCanvas()

    activeCarpet.value?.render(contextState.value, scope)
  }
})
</script>

<template>
  <canvas ref="myCanvas" :style="{ zoom: contextState.scale }" />
</template>
