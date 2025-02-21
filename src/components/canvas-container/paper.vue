<script lang="ts" setup>
import { TEXT_FONT_SIZE, TEXT_LINE_HEIGHT, TEXT_PRIMARY_COLOR } from '@/constants';
import { downloadURI, rgbToCmyk } from '@/lib/utils';
import { useLayoutStore } from '@/stores/layout';
import type { IRenderCarpet } from '@/types';
import paper from 'paper';
import { storeToRefs } from 'pinia';
import { onMounted, useTemplateRef, watch } from 'vue';

const layoutStore = useLayoutStore();
const { contextState, activeCarpet } = storeToRefs(layoutStore);
const canvasRef = useTemplateRef<HTMLCanvasElement>('myCanvas');
const scope = new paper.PaperScope();
let contentRender: IRenderCarpet | null = null;

let rectangle: paper.Path.Rectangle | null;
let text: paper.PointText | null;

const createText = () => {
	if (contextState.value.remark) {
		if (!rectangle) {
			rectangle = new scope.Path.Rectangle({
				point: [-TEXT_LINE_HEIGHT, 0],
				size: [TEXT_LINE_HEIGHT, contextState.value.height],
				fillColor: 'white',
			});
		}

		if (!text) {
			// 创建一个 PointText 对象
			text = new scope.PointText({
				point: [-TEXT_LINE_HEIGHT, contextState.value.height - 5], // 设置文字的位置
				content: contextState.value.remark, // 设置文字内容
				fillColor: TEXT_PRIMARY_COLOR, // 设置文字颜色
				justification: 'left', // 设置文字对齐方式
				fontSize: TEXT_FONT_SIZE, // 设置文字大小
				leading: 1,
				rotation: -90, // 设置文字旋转角度，使其垂直显示
			});
		}

		rectangle.bounds.size = new scope.Size(TEXT_LINE_HEIGHT, contextState.value.height);
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
	scope.view.viewSize.height = contextState.value.height;

	if (contextState.value.remark) {
		scope.view.viewSize.width = contextState.value.width + TEXT_LINE_HEIGHT;
		// 将画布坐标系向右平移 TEXT_LINE_HEIGHT
		scope.view.matrix = new scope.Matrix().translate(TEXT_LINE_HEIGHT, 0);
	} else {
		scope.view.viewSize.width = contextState.value.width;
		scope.view.matrix.reset();
	}
};

onMounted(() => {
	if (canvasRef.value) {
		// 初始化 paper.js 画布
		scope.setup(canvasRef.value);
		updateViewSize();
		contentRender = activeCarpet.value.render(scope);
		contentRender.render(contextState.value);
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
		contentRender?.render(contextState.value);
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
