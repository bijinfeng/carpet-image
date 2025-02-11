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

interface CalculateOptimalSquareSizeParams {
	x: number;
	y: number;
	defaultSize: number;
	tolerance?: number;
	step?: number;
	evenOdd?: 'even' | 'odd';
}

export function calculateOptimalSquareSize(params: CalculateOptimalSquareSizeParams): number {
	const { x, y, defaultSize, tolerance = 0.2, step = 0.001, evenOdd } = params;

	let optimalSize = defaultSize;
	let minRemainder = Number.MAX_VALUE;

	for (let bias = 0; bias <= tolerance; bias += step) {
		const sizes = [defaultSize - bias, defaultSize + bias];

		for (const size of sizes) {
			const remainderWidth = x % size;
			const remainderHeight = y % size;
			const totalRemainder = remainderWidth + remainderHeight;

			const numBlocksX = Math.floor(x / size);
			const numBlocksY = Math.floor(y / size);

			if (totalRemainder < minRemainder) {
				if (evenOdd === 'even' && (numBlocksX % 2 !== 0 || numBlocksY % 2 !== 0)) continue;
				if (evenOdd === 'odd' && (numBlocksX % 2 === 0 || numBlocksY % 2 === 0)) continue;

				minRemainder = totalRemainder;
				optimalSize = size;
			}
		}
	}

	return optimalSize;
}

export function calculateImageScale(_height: number) {
	// 画布的宽大于 30cm 时，每超过 20 cm，图片就会变大 1.2 倍
	const height = _height / CM_TO_PX;
	if (height <= 30) return 1;

	return 1 + Math.ceil((height - 30) / 20) * 0.2;
}
