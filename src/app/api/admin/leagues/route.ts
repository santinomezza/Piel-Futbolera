import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const leagueSchema = z.object({
  name: z.string().min(2, 'El nombre de la liga debe tener al menos 2 caracteres'),
  countryId: z.string().min(1, 'El país es requerido'),
  logoUrl: z.string().optional(),
  color: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const countryId = searchParams.get('countryId')

    const leagues = await prisma.league.findMany({
      where: countryId ? { countryId } : {},
      orderBy: { name: 'asc' },
      include: {
        country: true,
        _count: { select: { products: true } },
      },
    })

    return NextResponse.json({ leagues })
  } catch (error) {
    console.error('❌ Error fetching leagues:', error)
    return NextResponse.json({ error: 'Error al obtener las ligas' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = leagueSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de liga inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { name, countryId, logoUrl, color } = parsed.data
    const cleanName = name.trim()

    // Verify country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    })

    if (!country) {
      return NextResponse.json({ error: 'El país especificado no existe' }, { status: 400 })
    }

    const existing = await prisma.league.findFirst({
      where: {
        name: { equals: cleanName },
        countryId,
      },
    })

    if (existing) {
      return NextResponse.json({ league: existing, created: false })
    }

    const league = await prisma.league.create({
      data: {
        name: cleanName,
        countryId,
        logoUrl,
        color: color || '#00A3E0',
      },
      include: {
        country: true,
      },
    })

    return NextResponse.json({ league, created: true }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating league:', error)
    return NextResponse.json({ error: 'Error al crear la liga' }, { status: 500 })
  }
}
