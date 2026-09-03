import { prisma } from '@/lib/prisma'
import type { HeaderSection } from '@/components/store/Header'

let cachedSections: HeaderSection[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60_000

export async function getNavSections(): Promise<HeaderSection[]> {
  const now = Date.now()
  if (cachedSections && now - cacheTimestamp < CACHE_TTL) {
    return cachedSections
  }

  const sections = await prisma.section.findMany({
    orderBy: { order: 'asc' },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        select: { id: true, slug: true, name: true },
      },
    },
  })

  cachedSections = sections.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    categories: s.categories,
  }))
  cacheTimestamp = now
  return cachedSections
}
