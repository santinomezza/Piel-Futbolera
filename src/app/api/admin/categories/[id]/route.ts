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

const categoryUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
  sectionId: z.string().min(1).optional(),
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
  const parsed = categoryUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const category = await prisma.category.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ success: true, category })
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
