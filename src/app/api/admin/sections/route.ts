import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const ADMIN_TOKEN = 'authenticated_token_pielfutbolera_admin_2026'

const sectionSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  name: z.string().min(2).max(80),
  description: z.string().optional().nullable(),
  order: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
})

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session || session.value !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const sections = await prisma.section.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { categories: true } } },
  })
  return NextResponse.json({ sections })
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`sections:${ip}`, 20, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 })
  }

  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session || session.value !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = sectionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const section = await prisma.section.create({ data: parsed.data })
  return NextResponse.json({ success: true, section })
}
