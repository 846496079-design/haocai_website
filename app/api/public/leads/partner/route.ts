import { acceptPublicLead } from '@/lib/leads/public-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return acceptPublicLead(request, 'PARTNER')
}
