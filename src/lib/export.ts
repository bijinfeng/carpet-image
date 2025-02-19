import paper from 'paper';

// 导出图层为 base64 编码的 PNG 数据
// 注意：JPG 不支持透明度, 如果你的图层包含透明部分, 建议先将背景填充为白色或其他颜色
export function exportLayerToJPG(layer: paper.Layer, quality = 0.92) {
	const bounds = layer.bounds;

	// 创建一个临时的 canvas
	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = layer.view.viewSize.width;
	tempCanvas.height = layer.view.viewSize.height;
	const tempContext = tempCanvas.getContext('2d');

	// 将背景填充为白色（如果需要）
	if (tempContext) {
		tempContext.fillStyle = '#FFFFFF'; // 或者你想要的任何颜色
		tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	}

	const tempProject = new paper.Project(tempCanvas);

	// 克隆图层（保留变换矩阵）
	const clonedLayer = layer.clone({
		insert: true,
		applyMatrix: true,
	});

	// 调整临时项目视图
	tempProject.view.center = bounds.center;

	// 设置渲染范围
	tempProject.view.viewSize = new paper.Size(bounds.width, bounds.height);

	// 绘制图层到临时 canvas
	tempProject.activeLayer.addChild(clonedLayer);

	// 执行渲染
	tempProject.view.update();

	// 导出为 JPG 数据 URL
	const jpgData = tempCanvas.toDataURL('image/jpeg', quality);

	// 触发下载
	const link = document.createElement('a');
	link.download = 'fileName.jpg';
	link.href = jpgData;
	link.click();

	// 清理临时项目
	tempProject.remove();
}
