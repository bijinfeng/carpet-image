import { Decimal } from 'decimal.js';

// cm 到 px 转换比例
export const CM_TO_PX = Decimal.div(28.3466, window.devicePixelRatio || 1).toNumber();
export const TEXT_LINE_HEIGHT = 30;
export const TEXT_FONT_SIZE = 24;
// 文本主色调
export const TEXT_PRIMARY_COLOR = 'red';
