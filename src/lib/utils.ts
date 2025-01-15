import type { MagickInputFile } from 'wasm-imagemagick'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as Magick from 'wasm-imagemagick'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadURI(uri: string, name: string) {
  const link = document.createElement('a')
  link.download = name
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

interface CalculateOptimalSquareSizeParams {
  x: number
  y: number
  defaultSize: number
  tolerance?: number
  step?: number
  evenOdd?: 'even' | 'odd'
}

export function calculateOptimalSquareSize(params: CalculateOptimalSquareSizeParams): number {
  const { x, y, defaultSize, tolerance = 0.2, step = 0.001, evenOdd } = params

  let optimalSize = defaultSize
  let minRemainder = Number.MAX_VALUE

  for (let bias = 0; bias <= tolerance; bias += step) {
    const sizes = [defaultSize - bias, defaultSize + bias]

    for (const size of sizes) {
      const remainderWidth = x % size
      const remainderHeight = y % size
      const totalRemainder = remainderWidth + remainderHeight

      const numBlocksX = Math.floor(x / size)
      const numBlocksY = Math.floor(y / size)

      if (totalRemainder < minRemainder) {
        if (evenOdd === 'even' && (numBlocksX % 2 !== 0 || numBlocksY % 2 !== 0))
          continue
        if (evenOdd === 'odd' && (numBlocksX % 2 === 0 || numBlocksY % 2 === 0))
          continue

        minRemainder = totalRemainder
        optimalSize = size
      }
    }
  }

  return optimalSize
}

// 将 base64 编码的数据 URL 转换为 ArrayBuffer
export function base64ToArrayBuffer(base64: string): Uint8Array<ArrayBuffer> {
  const binaryString = atob(base64.split(',')[1])
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes
}

// 将 RGB 色彩空间的图像转换成 CMYK 色彩空间
export async function rgbToCmyk(sourceBytes: Uint8Array<ArrayBufferLike>): Promise<Blob> {
  const inputFiles: MagickInputFile[] = [{ name: 'input-image.png', content: sourceBytes }]
  const command = ['convert', 'input-image.png', '-colorspace', 'CMYK', 'output-image.tif']

  const processedFiles = await Magick.Call(inputFiles, command)
  const firstOutputImage = processedFiles[0]

  return firstOutputImage.blob
}
