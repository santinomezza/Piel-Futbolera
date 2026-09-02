import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getPaymentStatus } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id')

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Body might be empty in standard MP GET/POST webhooks
    }

    const effectivePaymentId = paymentId || body?.data?.id || body?.id

    if (!effectivePaymentId) {
      return NextResponse.json({ message: 'No payment ID in webhook' }, { status: 200 })
    }

    console.log(`🔔 Webhook received for Payment ID: ${effectivePaymentId}`)

    // Query official Mercado Pago API to verify authentic state
    const paymentInfo = await getPaymentStatus(effectivePaymentId)

    if (!paymentInfo || !paymentInfo.externalReference) {
      console.warn(`⚠️ Payment ${effectivePaymentId} not found or missing external reference`)
      return NextResponse.json({ message: 'Payment verification failed' }, { status: 200 })
    }

    const orderId = paymentInfo.externalReference
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    })

    if (!order) {
      console.warn(`⚠️ Order ${orderId} not found in database`)
      return NextResponse.json({ message: 'Order not found' }, { status: 200 })
    }

    // Process status update
    if (paymentInfo.status === 'approved' && order.status !== 'PAID') {
      console.log(`✅ Payment approved for Order ${order.orderNumber}. Updating DB & Stock...`)

      // 1. Transaction to update order, reduce stock, and record payment info
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update Order
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            trackingCode: order.courier === 'ANDREANI' ? `AND-${Date.now().toString().slice(-8)}` : `CA-${Date.now().toString().slice(-8)}`,
          },
        })

        // Update Payment record
        await tx.payment.create({
          data: {
            orderId: order.id,
            mpPaymentId: paymentInfo.id,
            status: 'approved',
            paymentMethodId: paymentInfo.paymentMethodId || 'mercadopago',
          },
        })

        // Reduce stock atomically for each variant
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }

        // Update Shipment record status
        await tx.shipment.updateMany({
          where: { orderId: order.id },
          data: {
            status: 'GENERATED',
            trackingNumber: order.courier === 'ANDREANI' ? `AND-${Date.now().toString().slice(-8)}` : `CA-${Date.now().toString().slice(-8)}`,
          },
        })
      })
    } else if (paymentInfo.status === 'rejected') {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          mpPaymentId: paymentInfo.id,
          status: 'rejected',
          paymentMethodId: paymentInfo.paymentMethodId || 'mercadopago',
        },
      })
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('❌ Error processing Mercado Pago Webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
