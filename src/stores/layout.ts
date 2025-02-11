import { carpetList } from '@/render';
import type { CarpetData, IContextState } from '@/types';

import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

function createContextState(data: CarpetData): IContextState {
	return {
		carpetName: data.name,
		width: data.defaultSize.width,
		height: data.defaultSize.height,
		scale: 1,
		remark: '',
		radius: {
			leftTop: 0,
			rightTop: 0,
			rightBottom: 0,
			leftBottom: 0,
		},
	};
}

export const useLayoutStore = defineStore('layout', () => {
	const activeCarpet = ref<CarpetData>(carpetList[0]);
	const contextState = reactive(createContextState(carpetList[0]));

	const switchCarpet = (item: CarpetData) => {
		if (item.id === activeCarpet.value.id) return;

		activeCarpet.value = item;
		Object.assign(contextState, createContextState(item));
	};

	return { activeCarpet, contextState, switchCarpet };
});
