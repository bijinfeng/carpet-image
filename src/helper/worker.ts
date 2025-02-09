// worker.ts
self.onmessage = (event) => {
  const receivedData = event.data;
  console.log(`Data received from main thread: ${receivedData}`);

  // 处理数据
  const result = receivedData * 2; // 示例处理

  // 发送结果回主线程
  self.postMessage(result);
};
