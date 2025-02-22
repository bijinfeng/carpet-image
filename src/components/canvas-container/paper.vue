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

let text: paper.Item;

const createText = () => {
	text?.remove();

	if (!contextState.value.remark) return;

	const textSvg = `
		<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${contextState.value.height}" height="${TEXT_LINE_HEIGHT}">
			<rect width="${contextState.value.height}" height="${TEXT_LINE_HEIGHT}" fill="white" />
			<text
				x="5"
				y="${TEXT_LINE_HEIGHT * 0.8}"
				fill="${TEXT_PRIMARY_COLOR}"
				text-anchor="start"
				font-family="Arial"
				line-height="exact"
				text-height="fixed"
				dominant-baseline="middle"
				font-size="${TEXT_FONT_SIZE}"
			>
				${contextState.value.remark}
			</text>
		</svg>
	`;

	text = paper.project.importSVG(textSvg, {
		expandShapes: true,
		onLoad: (svg: paper.Item) => {
			svg.position = new paper.Point(-TEXT_LINE_HEIGHT / 2, contextState.value.height / 2);
			svg.rotate(-90, svg.position);
		},
	});
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

const renderPaper = () => {
	updateViewSize();
	createText();
	contentRender.value.render(contextState.value);
};

onMounted(() => {
	if (canvasRef.value) {
		// 初始化 paper.js 画布
		paper.setup(canvasRef.value);
		renderPaper();
	}
});

watch(
	() => [contextState.value.width, contextState.value.height, contextState.value.radius, contextState.value.remark],
	() => renderPaper(),
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
