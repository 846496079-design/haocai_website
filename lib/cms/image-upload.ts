export type CmsImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp'

export type CmsImageSourceFormat = {
  mimeType: CmsImageMimeType
  extension: 'jpg' | 'png' | 'webp'
}

type SharpMetadata = {
  width?: number
  height?: number
  hasAlpha?: boolean
}

type SharpPipeline = {
  metadata(): Promise<SharpMetadata>
  rotate(): SharpPipeline
  resize(options: Record<string, unknown>): SharpPipeline
  png(options: Record<string, unknown>): SharpPipeline
  jpeg(options: Record<string, unknown>): SharpPipeline
  toBuffer(): Promise<Buffer>
}

export type SharpFactory = (source: Buffer) => SharpPipeline
export type SharpFactoryLoader = () => Promise<SharpFactory>

export type CmsProcessedImage = {
  processingMode: 'optimized' | 'original'
  main: Buffer
  thumbnail: Buffer | null
  mimeType: CmsImageMimeType
  extension: 'jpg' | 'png' | 'webp'
  width: number
  height: number
  optimizationError?: unknown
}

export class InvalidCmsImageError extends Error {
  constructor(message = '图片文件无效。') {
    super(message)
    this.name = 'InvalidCmsImageError'
  }
}

export function inspectCmsImageSource(source: Buffer): CmsImageSourceFormat {
  if (source.length >= 3 && source[0] === 0xff && source[1] === 0xd8 && source[2] === 0xff) {
    return { mimeType: 'image/jpeg', extension: 'jpg' }
  }
  if (
    source.length >= 8
    && source[0] === 0x89
    && source[1] === 0x50
    && source[2] === 0x4e
    && source[3] === 0x47
    && source[4] === 0x0d
    && source[5] === 0x0a
    && source[6] === 0x1a
    && source[7] === 0x0a
  ) {
    return { mimeType: 'image/png', extension: 'png' }
  }
  if (
    source.length >= 12
    && source.subarray(0, 4).toString('ascii') === 'RIFF'
    && source.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mimeType: 'image/webp', extension: 'webp' }
  }
  throw new InvalidCmsImageError('仅支持有效的 JPEG、PNG 或 WebP 图片。')
}

async function loadSharpFactory(): Promise<SharpFactory> {
  const moduleValue = await import('sharp')
  return moduleValue.default as unknown as SharpFactory
}

function originalResult(
  source: Buffer,
  format: CmsImageSourceFormat,
  optimizationError: unknown,
  dimensions?: { width: number; height: number },
): CmsProcessedImage {
  return {
    processingMode: 'original',
    main: source,
    thumbnail: null,
    mimeType: format.mimeType,
    extension: format.extension,
    width: dimensions?.width ?? 1,
    height: dimensions?.height ?? 1,
    optimizationError,
  }
}

export async function processCmsImage(
  source: Buffer,
  format: CmsImageSourceFormat,
  loadFactory: SharpFactoryLoader = loadSharpFactory,
): Promise<CmsProcessedImage> {
  let sharpFactory: SharpFactory
  try {
    sharpFactory = await loadFactory()
  } catch (error) {
    return originalResult(source, format, error)
  }

  let metadataPipeline: SharpPipeline
  try {
    metadataPipeline = sharpFactory(source)
  } catch (error) {
    return originalResult(source, format, error)
  }

  let metadata: SharpMetadata
  try {
    metadata = await metadataPipeline.metadata()
  } catch {
    throw new InvalidCmsImageError()
  }
  if (!metadata.width || !metadata.height) throw new InvalidCmsImageError()

  try {
    const preserveTransparency = Boolean(metadata.hasAlpha)
    const mimeType = preserveTransparency ? 'image/png' : 'image/jpeg'
    const extension = preserveTransparency ? 'png' : 'jpg'
    const mainPipeline = sharpFactory(source).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    const thumbnailPipeline = sharpFactory(source).rotate().resize({ width: 960, height: 540, fit: 'cover', position: 'attention' })
    const [main, thumbnail] = await Promise.all([
      preserveTransparency ? mainPipeline.png({ compressionLevel: 9 }).toBuffer() : mainPipeline.jpeg({ quality: 86, mozjpeg: true }).toBuffer(),
      preserveTransparency ? thumbnailPipeline.png({ compressionLevel: 9 }).toBuffer() : thumbnailPipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
    ])
    return {
      processingMode: 'optimized',
      main,
      thumbnail,
      mimeType,
      extension,
      width: metadata.width,
      height: metadata.height,
    }
  } catch (error) {
    return originalResult(source, format, error, { width: metadata.width, height: metadata.height })
  }
}
