import 'server-only'

import { revalidatePath } from 'next/cache'

const sites = ['cn', 'jp', 'hk'] as const

export function revalidatePublicNews(slug?: string) {
  for (const site of sites) {
    revalidatePath(`/${site}/`)
    revalidatePath(`/${site}/news/`)
    if (slug) revalidatePath(`/${site}/news/${slug}/`)
    else revalidatePath(`/${site}/news/[slug]`, 'page')
  }
}
