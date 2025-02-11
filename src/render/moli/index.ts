import moliUrl from '@/assets/moli/moli.webp';
import { CM_TO_PX } from '@/constants';
import type { CarpetData } from '@/types';
import { render } from './render';

export const moli: CarpetData = {
	id: 1,
	name: '墨语',
	assetUrl: moliUrl,
	step: 0.1,
	defaultSize: { width: CM_TO_PX * 240, height: CM_TO_PX * 60 },
	render,
};
