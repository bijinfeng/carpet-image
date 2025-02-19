import { RectRadius } from '@/lib/rect-radius';
import paper from 'paper';

class TempCanvas extends RectRadius {
	private canvasElement: HTMLCanvasElement | null = null;

	constructor() {
		const scope = new paper.PaperScope();
		super(scope);
	}

	public setup(element: HTMLCanvasElement) {
		this.canvasElement = element;
		this.scope.setup(element);
	}

	public updateSize(rectWidth: number, rectHeight: number) {
		this.scope.view.viewSize.width = rectWidth;
		this.scope.view.viewSize.height = rectHeight;
	}

	public exportSVG() {
		return this.scope.project.exportSVG({ asString: true });
	}
}

export const tempCanvasRender = new TempCanvas();
