import { ColorProfile, ColorSpace, CompressionMethod, ImageMagick, initializeImageMagick, MagickFormat } from '@imagemagick/magick-wasm'

class ImageMagickConverter {
  private initializePromise: Promise<void>
  private profileNameMaps = {
    cmyk: 'JapanColor2001Coated.icc',
    rgb: 'SRGB.icm',
  }

  constructor() {
    const wasmLocation = new URL('@imagemagick/magick-wasm/magick.wasm', import.meta.url)
    this.initializePromise = initializeImageMagick(wasmLocation)
  }

  private base64ToArrayBuffer(base64: string): Uint8Array<ArrayBuffer> {
    const binaryString = atob(base64.split(',')[1])
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes
  }

  private async fetchIccProfile(profileName: keyof typeof this.profileNameMaps): Promise<ColorProfile> {
    const response = await fetch(`/${this.profileNameMaps[profileName]}`)
    if (!response.ok) {
      throw new Error(`Failed to load ICC profile: ${response.statusText}`)
    }

    // 将响应转换为 ArrayBuffer
    const arrayBuffer = await response.arrayBuffer()
    // 转换为 Uint8Array
    return new ColorProfile(new Uint8Array(arrayBuffer))
  }

  async rgbToCmyk(base64: string): Promise<Blob> {
    await this.initializePromise

    const sourceBytes = this.base64ToArrayBuffer(base64)

    return new Promise((resolve) => {
      // 从 Base64 数据 URL 创建 Image
      ImageMagick.read(sourceBytes, MagickFormat.Png, async (image) => {
        const [rgbProfile, cmykProfile] = await Promise.all([
          this.fetchIccProfile('rgb'),
          this.fetchIccProfile('cmyk'),
        ])

        // 将图像转换为 CMYK 色彩空间
        image.transformColorSpace(rgbProfile, cmykProfile)
        // 设置颜色空间为 CMYK 和 8 位深度
        image.colorSpace = ColorSpace.CMYK
        image.depth = 8

        // 使用 Zip 压缩下图片
        image.settings.compression = CompressionMethod.Zip

        image.write(MagickFormat.Tiff, (newData) => {
          // 在这里可以获取转换后的图像数据
          const blob = new Blob([newData], { type: 'image/tiff' })
          resolve(blob)
        })
      })
    })
  }
}

export const imageMagickConverter = new ImageMagickConverter()
