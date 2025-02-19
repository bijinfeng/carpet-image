<script lang="ts" setup>
import { tempCanvasRender } from '@/lib/temp-canvas';
import { onMounted, useTemplateRef } from 'vue';

const tempCanvasRef = useTemplateRef<HTMLCanvasElement>('tempCanvas');

onMounted(() => {
	if (tempCanvasRef.value) {
		// 初始化 paper.js 画布
		tempCanvasRender.setup(tempCanvasRef.value);
	}
});
</script>

<template>
	<canvas ref="tempCanvas" class="hidden" style="zoom: 0.1;" />
</template>
