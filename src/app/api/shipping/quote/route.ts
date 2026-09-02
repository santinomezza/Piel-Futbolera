import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getShippingQuotes } from '@/lib/shipping'

const quoteSchema = z.object({
  postalCode: z.string().min(4, 'Código postal inválido').max(10),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = quoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Código postal inválido', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const quotes = await getShippingQuotes(parsed.data.postalCode)
    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('❌ Shipping quote endpoint error:', error)
    return NextResponse.json({ error: 'Error al calcular costos de envío' }, { status: 500 })
  }
}
