import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const sectionSlug = url.searchParams.get('sectionSlug')
  const sectionId = url.searchParams.get('sectionId')

  const where: Record<string, unknown> = {}
  if (sectionSlug) where.slug = sectionSlug
  if (sectionId) where.id = sectionId

  const sections = await prisma.section.findMany({
    where,
    orderBy: { order: 'asc' },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        select: { id: true, slug: true, name: true, description: true },
      },
    },
  })

  return NextResponse.json({ sections }, {
    headers: { 'Cache-Control': 'public, max-age=30' },
  })
}
