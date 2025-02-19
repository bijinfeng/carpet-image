import moliUrl from '@/assets/moli/moli.webp';
import { CM_TO_PX } from '@/constants';
import type { CarpetData } from '@/types';
import { Decimal } from 'decimal.js';
import { render } from './render';

export const moli: CarpetData = {
	id: 1,
	name: '墨语',
	assetUrl: moliUrl,
	step: 0.1,
	defaultSize: { width: Decimal.mul(CM_TO_PX, 240).toNumber(), height: Decimal.mul(CM_TO_PX, 56).toNumber() },
	render,
};
