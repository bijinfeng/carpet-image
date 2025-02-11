import zhongxiaUrl from '@/assets/zhongxia/zhong-xia.webp';
import { CM_TO_PX } from '@/constants';
import type { CarpetData } from '@/types';
import { render } from './render';

export const zhongxia: CarpetData = {
	id: 2,
	name: '盛夏',
	assetUrl: zhongxiaUrl,
	step: 0.1,
	defaultSize: { width: CM_TO_PX * 120, height: CM_TO_PX * 30 },
	render,
};
