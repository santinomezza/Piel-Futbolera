import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { encryptSecret } from '@/lib/storeConfig'

const ADMIN_TOKEN = 'authenticated_token_pielfutbolera_admin_2026'

const configSchema = z.object({
  mpPublicKey: z.string().optional().nullable(),
  mpAccessToken: z.string().optional().nullable(),
})

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session || session.value !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const pub = await prisma.storeConfig.findUnique({ where: { key: 'mp_public_key' } })
  const priv = await prisma.storeConfig.findUnique({
    where: { key: 'mp_access_token_encrypted' },
  })

  return NextResponse.json({
    mpPublicKey: pub?.value ?? '',
    mpAccessTokenSet: Boolean(priv?.value),
  })
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session || session.value !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = configSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { mpPublicKey, mpAccessToken } = parsed.data

  if (mpPublicKey !== undefined && mpPublicKey !== null) {
    await prisma.storeConfig.upsert({
      where: { key: 'mp_public_key' },
      update: { value: mpPublicKey },
      create: { key: 'mp_public_key', value: mpPublicKey },
    })
  }

  if (mpAccessToken !== undefined && mpAccessToken !== null && mpAccessToken.length > 0) {
    const encrypted = encryptSecret(mpAccessToken)
    await prisma.storeConfig.upsert({
      where: { key: 'mp_access_token_encrypted' },
      update: { value: encrypted },
      create: { key: 'mp_access_token_encrypted', value: encrypted },
    })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session || session.value !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url = new URL(req.url)
  const key = url.searchParams.get('key')
  if (!key || !['mp_public_key', 'mp_access_token_encrypted'].includes(key)) {
    return NextResponse.json({ error: 'Key inválida' }, { status: 400 })
  }

  await prisma.storeConfig.deleteMany({ where: { key } })
  return NextResponse.json({ success: true })
}
