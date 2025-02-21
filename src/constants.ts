import { Decimal } from 'decimal.js';

// cm 到 px 转换比例
export const PIXEL_RATIO = window.devicePixelRatio || 1;
export const CM_TO_PX = Decimal.div(28.3466, PIXEL_RATIO).toNumber();
export const TEXT_LINE_HEIGHT = Decimal.div(30, PIXEL_RATIO).toNumber();
export const TEXT_FONT_SIZE = Decimal.div(24, PIXEL_RATIO).toNumber();

// 文本主色调
export const TEXT_PRIMARY_COLOR = 'red';
