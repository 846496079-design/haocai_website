export type CmsUploadResponse = {
  assetId: string
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  mimeType?: string
  processingMode: 'optimized' | 'original'
  message?: string
}

export async function readCmsUploadResponse(response: Response): Promise<CmsUploadResponse> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  let payload: Partial<CmsUploadResponse> & { message?: string } = {}

  if (contentType.includes('application/json')) {
    try {
      payload = await response.json() as Partial<CmsUploadResponse> & { message?: string }
    } catch {
      payload = {}
    }
  } else {
    await response.text().catch(() => '')
  }

  if (!response.ok) {
    throw new Error(payload.message?.trim() || '图片服务暂时不可用，请稍后重试。')
  }
  if (!payload.url || !payload.assetId) {
    throw new Error('图片服务返回异常，请稍后重试。')
  }

  return {
    assetId: payload.assetId,
    url: payload.url,
    thumbnailUrl: payload.thumbnailUrl,
    width: payload.width,
    height: payload.height,
    mimeType: payload.mimeType,
    processingMode: payload.processingMode === 'original' ? 'original' : 'optimized',
    message: payload.message,
  }
}
