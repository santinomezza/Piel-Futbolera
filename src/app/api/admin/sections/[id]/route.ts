import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const ADMIN_TOKEN = 'authenticated_token_pielfutbolera_admin_2026'

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return Boolean(session && session.value === ADMIN_TOKEN)
}

const sectionUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(req: Request, { params }: RouteContext) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = sectionUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const section = await prisma.section.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ success: true, section })
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await prisma.section.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
