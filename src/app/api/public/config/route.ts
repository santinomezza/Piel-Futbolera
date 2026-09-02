import { NextResponse } from 'next/server'
import { getPublicConfig } from '@/lib/mercadopago'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cfg = await getPublicConfig()
  return NextResponse.json(cfg, {
    headers: {
      'Cache-Control': 'public, max-age=60',
    },
  })
}
