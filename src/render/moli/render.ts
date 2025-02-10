import textImage from '@/assets/moli/moli-text.jpg';
import type { IRenderCarpet, RenderProps } from '@/types';

const BLOCK_PADDING = 30;

class Render implements IRenderCarpet {
	private rect: paper.Path.Rectangle | null = null;

	constructor(private scope: paper.PaperScope) {}

	init(props: RenderProps) {
		// 创建带不同圆角的矩形路径
		this.rect = new this.scope.Path.Rectangle({
			point: [BLOCK_PADDING / 2, BLOCK_PADDING / 2],
			size: [props.width - BLOCK_PADDING, props.height - BLOCK_PADDING], // 终点坐标
			radius: [props.radius.leftTop, props.radius.rightTop, props.radius.rightBottom, props.radius.leftBottom], // 四个圆角半径: [左上, 右上, 右下, 左下]
			strokeColor: 'black',
			strokeWidth: BLOCK_PADDING,
			fillColor: 'white', // 填充白色背景色
		});

		const image = new this.scope.Raster({
			source: textImage, // 使用导入的图片 URL
			position: this.scope.view.center,
		});
	}

	update(props: RenderProps) {
		this.rect?.set({
			size: [props.width - BLOCK_PADDING, props.height - BLOCK_PADDING], // 终点坐标
			radius: [props.radius.leftTop, props.radius.rightTop, props.radius.rightBottom, props.radius.leftBottom],
		});
	}
}

export const render = (scope: paper.PaperScope) => new Render(scope);
