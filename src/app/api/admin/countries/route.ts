import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const countrySchema = z.object({
  name: z.string().min(2, 'El nombre del país debe tener al menos 2 caracteres'),
  code: z.string().optional(),
})

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { leagues: true, products: true },
        },
      },
    })
    return NextResponse.json({ countries })
  } catch (error) {
    console.error('❌ Error fetching countries:', error)
    return NextResponse.json({ error: 'Error al obtener los países' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = countrySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { name, code } = parsed.data
    const cleanName = name.trim()

    const existing = await prisma.country.findFirst({
      where: { name: { equals: cleanName } },
    })

    if (existing) {
      return NextResponse.json({ country: existing, created: false })
    }

    const country = await prisma.country.create({
      data: {
        name: cleanName,
        code: code ? code.trim().toUpperCase() : undefined,
      },
    })

    return NextResponse.json({ country, created: true }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating country:', error)
    return NextResponse.json({ error: 'Error al crear el país' }, { status: 500 })
  }
}
