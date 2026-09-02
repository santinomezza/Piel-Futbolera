import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const statusSchema = z.object({
  orderId: z.string(),
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingCode: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = statusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Estado de orden inválido' }, { status: 400 })
    }

    const { orderId, status, trackingCode } = parsed.data

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingCode ? { trackingCode } : {}),
      },
    })

    if (trackingCode) {
      await prisma.shipment.updateMany({
        where: { orderId },
        data: { trackingNumber: trackingCode, status: status === 'SHIPPED' ? 'IN_TRANSIT' : 'GENERATED' },
      })
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('❌ Order status update error:', error)
    return NextResponse.json({ error: 'Error al actualizar el estado de la orden' }, { status: 500 })
  }
}
