import zhongxiaUrl from '@/assets/zhongxia/zhong-xia.webp';
import { CM_TO_PX } from '@/constants';
import type { CarpetData } from '@/types';
import { Decimal } from 'decimal.js';
import { render } from './render';

export const zhongxia: CarpetData = {
	id: 'shengxia',
	name: '盛夏',
	assetUrl: zhongxiaUrl,
	step: 0.1,
	defaultSize: { width: Decimal.mul(CM_TO_PX, 120).toNumber(), height: Decimal.mul(CM_TO_PX, 30).toNumber() },
	render,
};
