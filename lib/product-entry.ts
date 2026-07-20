export const desktopProductUrl = 'https://finance-ai.haocai360.cn/sign-in'
export const mobileProductUrl = 'https://finance-h5.haocai360.cn/'
export const productEntryPath = '/go/product/'

type ProductEntryRequest = {
  mobileHint?: string | null
  userAgent?: string | null
}

const mobileOrTabletUserAgent =
  /android|iphone|ipad|ipod|mobile|tablet|silk|kindle|playbook|opera mini|iemobile/i

export function resolveProductEntryUrl({ mobileHint, userAgent }: ProductEntryRequest) {
  if (mobileHint?.trim() === '?1') return mobileProductUrl
  if (mobileOrTabletUserAgent.test(userAgent ?? '')) return mobileProductUrl
  return desktopProductUrl
}
