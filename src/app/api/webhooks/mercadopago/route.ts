import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getPaymentStatus } from '@/lib/mercadopago'

function verifyMercadoPagoSignature(
  rawBody: string,
  signatureHeader: string | null,
  requestIdHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !requestIdHeader) return false
  const parts = signatureHeader.split(',')
  let ts: string | null = null
  let v1: string | null = null
  for (const p of parts) {
    const [k, v] = p.split('=')
    if (k === 'ts') ts = v
    if (k === 'v1') v1 = v
  }
  if (!ts || !v1) return false
  const manifest = `id=${requestIdHeader};ts=${ts};`
  const computed = createHmac('sha256', secret).update(manifest + rawBody).digest('hex')
  const a = Buffer.from(computed, 'hex')
  const b = Buffer.from(v1, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const secret = process.env.MP_WEBHOOK_SECRET

  if (secret) {
    const signature = req.headers.get('x-signature')
    const requestId = req.headers.get('x-request-id')
    const valid = verifyMercadoPagoSignature(rawBody, signature, requestId, secret)
    if (!valid) {
      console.warn('⚠️ Webhook rejected: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else {
    console.warn('⚠️ MP_WEBHOOK_SECRET not configured, skipping signature verification')
  }

  let body: unknown = {}
  try {
    body = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    body = {}
  }

  const b = body as { type?: string; data?: { id?: number | string }; id?: number | string }
  const url = new URL(req.url)
  const topic = url.searchParams.get('topic') || url.searchParams.get('type') || b?.type
  const paymentId =
    url.searchParams.get('data.id') ||
    url.searchParams.get('id') ||
    (b?.data?.id != null ? String(b.data.id) : null) ||
    (b?.id != null ? String(b.id) : null)

  if (!paymentId) {
    return NextResponse.json({ message: 'No payment ID in webhook' }, { status: 200 })
  }

  const logTopic = topic ? ` topic=${topic}` : ''
  console.log(`🔔 Webhook received for Payment ID: ${paymentId}${logTopic}`)

  const existingPayment = await prisma.payment.findFirst({
    where: { mpPaymentId: paymentId },
  })

  if (existingPayment) {
    console.log(`ℹ️ Payment ${paymentId} already processed, skipping`)
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  }

  const paymentInfo = await getPaymentStatus(paymentId)
  if (!paymentInfo || !paymentInfo.externalReference) {
    console.warn(`⚠️ Payment ${paymentId} not found or missing external reference`)
    return NextResponse.json({ message: 'Payment verification failed' }, { status: 200 })
  }

  const orderId = paymentInfo.externalReference
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true, shipments: true },
  })

  if (!order) {
    console.warn(`⚠️ Order ${orderId} not found in database`)
    return NextResponse.json({ message: 'Order not found' }, { status: 200 })
  }

  try {
    if (paymentInfo.status === 'approved') {
      if (order.status === 'PAID') {
        return NextResponse.json({ status: 'ok' }, { status: 200 })
      }

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        })

        await tx.payment.create({
          data: {
            orderId: order.id,
            mpPaymentId: paymentInfo.id!,
            status: 'approved',
            paymentMethodId: paymentInfo.paymentMethodId || 'mercadopago',
          },
        })

        await tx.shipment.updateMany({
          where: { orderId: order.id },
          data: { status: 'PENDING' },
        })
      })

      console.log(`✅ Payment approved for Order ${order.orderNumber}`)
    } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const existing = await tx.payment.findFirst({ where: { mpPaymentId: paymentId } })
        if (existing) return

        await tx.payment.create({
          data: {
            orderId: order.id,
            mpPaymentId: paymentInfo.id!,
            status: paymentInfo.status!,
            paymentMethodId: paymentInfo.paymentMethodId || 'mercadopago',
          },
        })

        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
        }

        if (order.status === 'PENDING') {
          await tx.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
          })
        }
      })

      console.log(`↩️ Payment ${paymentInfo.status} for Order ${order.orderNumber}, stock released`)
    } else {
      console.log(`ℹ️ Payment ${paymentId} in status ${paymentInfo.status}, no action`)
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('❌ Error processing Mercado Pago Webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
