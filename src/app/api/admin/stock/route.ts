import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const stockSchema = z.object({
  variantId: z.string(),
  newStock: z.number().int().min(0),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = stockSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos de stock inválidos' }, { status: 400 })
    }

    if (parsed.data.newStock === 0) {
      const orderItems = await prisma.orderItem.count({
        where: { variantId: parsed.data.variantId },
      })

      if (orderItems > 0) {
        await prisma.productVariant.update({
          where: { id: parsed.data.variantId },
          data: { stock: 0 },
        })
        return NextResponse.json({
          success: true,
          disabled: true,
          message: 'Variante con historial de ventas: se dejó en stock 0 en lugar de eliminarla.',
        })
      }

      await prisma.productVariant.delete({
        where: { id: parsed.data.variantId },
      })
      return NextResponse.json({ success: true, deleted: true })
    } else {
      const updatedVariant = await prisma.productVariant.update({
        where: { id: parsed.data.variantId },
        data: { stock: parsed.data.newStock },
      })
      return NextResponse.json({ success: true, variant: updatedVariant })
    }
  } catch (error) {
    console.error('❌ Stock update error:', error)
    return NextResponse.json({ error: 'Error al actualizar stock' }, { status: 500 })
  }
}
