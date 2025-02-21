<script lang="ts" setup>
import { TEXT_FONT_SIZE, TEXT_LINE_HEIGHT, TEXT_PRIMARY_COLOR } from '@/constants';
import { downloadURI, rgbToCmyk } from '@/lib/utils';
import { useLayoutStore } from '@/stores/layout';
import type { IRenderCarpet } from '@/types';
import paper from 'paper';
import { storeToRefs } from 'pinia';
import { computed, onMounted, useTemplateRef, watch } from 'vue';

const layoutStore = useLayoutStore();
const { contextState, activeCarpet } = storeToRefs(layoutStore);
const canvasRef = useTemplateRef<HTMLCanvasElement>('myCanvas');
const contentRender = computed<IRenderCarpet>(() => activeCarpet.value.render(paper));

let rectangle: paper.Path.Rectangle | null;
let text: paper.PointText | null;

const createText = () => {
	if (contextState.value.remark) {
		if (!rectangle) {
			rectangle = new paper.Path.Rectangle({
				point: [-TEXT_LINE_HEIGHT, 0],
				size: [TEXT_LINE_HEIGHT, contextState.value.height],
				fillColor: 'white',
			});
		}

		if (!text) {
			// 创建一个 PointText 对象
			text = new paper.PointText({
				point: [-TEXT_LINE_HEIGHT, contextState.value.height - 5], // 设置文字的位置
				content: contextState.value.remark, // 设置文字内容
				fillColor: TEXT_PRIMARY_COLOR, // 设置文字颜色
				justification: 'left', // 设置文字对齐方式
				fontSize: TEXT_FONT_SIZE, // 设置文字大小
				leading: 1,
				rotation: -90, // 设置文字旋转角度，使其垂直显示
			});
		}

		rectangle.bounds.size = new paper.Size(TEXT_LINE_HEIGHT, contextState.value.height);
		text.content = contextState.value.remark;
		text.position.y = contextState.value.height - 5 - text.bounds.height / 2;
	} else {
		rectangle?.remove();
		text?.remove();
		rectangle = null;
		text = null;
	}
};

const updateViewSize = () => {
	paper.view.viewSize.height = contextState.value.height;

	if (contextState.value.remark) {
		paper.view.viewSize.width = contextState.value.width + TEXT_LINE_HEIGHT;
		// 将画布坐标系向右平移 TEXT_LINE_HEIGHT
		paper.view.matrix = new paper.Matrix().translate(TEXT_LINE_HEIGHT, 0);
	} else {
		paper.view.viewSize.width = contextState.value.width;
		paper.view.matrix.reset();
	}
};

onMounted(() => {
	if (canvasRef.value) {
		// 初始化 paper.js 画布
		paper.setup(canvasRef.value);
		updateViewSize();
		contentRender.value.render(contextState.value);
	}
});

watch(
	() => contextState.value.remark,
	() => {
		updateViewSize();
		createText();
	},
);

watch(
	() => [contextState.value.width, contextState.value.height, contextState.value.radius],
	() => {
		updateViewSize();
		contentRender.value.render(contextState.value);
	},
	{ deep: true },
);

async function exportToTiff() {
	if (!canvasRef.value) return;

	const dataURL = canvasRef.value.toDataURL();
	const url = await rgbToCmyk(dataURL);
	downloadURI(url, `${contextState.value.remark || contextState.value.carpetName}.jpg`);
	URL.revokeObjectURL(url);
}

defineExpose({ exportToImage: exportToTiff });
</script>

<template>
  <canvas ref="myCanvas" :style="{ zoom: contextState.scale }" />
</template>
