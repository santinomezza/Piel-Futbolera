import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const ADMIN_TOKEN = 'authenticated_token_pielfutbolera_admin_2026'

const categorySchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(80),
  description: z.string().optional().nullable(),
  order: z.number().int().min(0).default(0),
  sectionId: z.string().min(1),
})

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session || session.value !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url = new URL(req.url)
  const sectionId = url.searchParams.get('sectionId')

  const categories = await prisma.category.findMany({
    where: sectionId ? { sectionId } : undefined,
    orderBy: { order: 'asc' },
    include: { section: true, _count: { select: { products: true } } },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`categories:${ip}`, 20, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 })
  }

  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session || session.value !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const category = await prisma.category.create({ data: parsed.data })
  return NextResponse.json({ success: true, category })
}
