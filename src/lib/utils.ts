import { CM_TO_PX } from '@/constants';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const imageMagickWorker = new Worker(new URL('@/helper/worker', import.meta.url), {
	type: 'module',
});

export const rgbToCmyk = (dataURL: string) => {
	return new Promise<string>((resolve) => {
		imageMagickWorker.onmessage = (event) => {
			resolve(event.data);
		};
		imageMagickWorker.postMessage(dataURL);
	});
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function downloadURI(uri: string, name: string) {
	const link = document.createElement('a');
	link.download = name;
	link.href = uri;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export function calculateImageScale(_height: number) {
	// 画布的宽大于 30cm 时，每超过 20 cm，图片就会变大 1.2 倍
	const height = _height / CM_TO_PX;
	if (height <= 30) return 1;

	return 1 + Math.ceil((height - 30) / 20) * 0.2;
}

// 获取小数位数
export function getDecimalPlacesFixed(num: number) {
	const numStr = String(Number(num)); // 将数字转换为字符串,并进行精度处理,10 可以根据业务需要调整。
	if (!numStr.includes('.')) {
		// 如果是整数,小数位数为 0
		return 0;
	}
	return numStr.split('.')[1].length; // 分割字符串,获取小数部分的长度
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
