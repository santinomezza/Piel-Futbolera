import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { createCheckoutPreference } from '@/lib/mercadopago'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email('Email inválido'),
    firstName: z.string().min(2, 'Nombre requerido'),
    lastName: z.string().min(2, 'Apellido requerido'),
    dni: z.string().min(6, 'DNI inválido'),
    phone: z.string().min(6, 'Teléfono inválido'),
    address: z.string().min(5, 'Dirección requerida'),
    city: z.string().min(2, 'Ciudad requerida'),
    province: z.string().min(2, 'Provincia requerida'),
    postalCode: z.string().min(4, 'Código postal inválido'),
  }),
  items: z.array(
    z.object({
      variantId: z.string(),
      productId: z.string(),
      name: z.string(),
      size: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'El carrito está vacío'),
  courier: z.enum(['ANDREANI', 'CORREO_ARGENTINO']),
  shippingFee: z.number().min(0),
})

async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const last = await tx.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  })
  let next = 1001
  if (last) {
    const m = last.orderNumber.match(/(\d+)$/)
    if (m) next = parseInt(m[1], 10) + 1
  }
  return `DOCE-${next}`
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`checkout:${ip}`, 10, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Esperá un momento.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  try {
    const body = await req.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de checkout inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { customer: custData, items, courier, shippingFee } = parsed.data

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalAmount = subtotal + shippingFee

    let orderId: string

    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        for (const item of items) {
          const updated = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          })

          if (updated.count === 0) {
            const current = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              select: { stock: true, size: true },
            })
            throw new StockError(
              `Stock insuficiente para ${item.name} (Talle ${current?.size || item.size}). Disponible: ${current?.stock ?? 0}`
            )
          }
        }

        const customer = await tx.customer.upsert({
          where: { email: custData.email },
          update: {
            firstName: custData.firstName,
            lastName: custData.lastName,
            dni: custData.dni,
            phone: custData.phone,
            address: custData.address,
            city: custData.city,
            province: custData.province,
            postalCode: custData.postalCode,
          },
          create: {
            email: custData.email,
            firstName: custData.firstName,
            lastName: custData.lastName,
            dni: custData.dni,
            phone: custData.phone,
            address: custData.address,
            city: custData.city,
            province: custData.province,
            postalCode: custData.postalCode,
          },
        })

        const number = await generateOrderNumber(tx)

        const order = await tx.order.create({
          data: {
            orderNumber: number,
            customerId: customer.id,
            status: 'PENDING',
            subtotal,
            shippingFee,
            totalAmount,
            courier,
            shippingAddress: JSON.stringify({
              address: custData.address,
              city: custData.city,
              province: custData.province,
              postalCode: custData.postalCode,
            }),
            items: {
              create: items.map((i) => ({
                variantId: i.variantId,
                quantity: i.quantity,
                unitPrice: i.price,
              })),
            },
            shipments: {
              create: [
                {
                  courier,
                  status: 'PENDING',
                },
              ],
            },
          },
        })

        return order
      })

      orderId = result.id
    } catch (err) {
      if (err instanceof StockError) {
        return NextResponse.json({ error: err.message }, { status: 400 })
      }
      throw err
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'No se pudo recuperar la orden creada' }, { status: 500 })
    }

    const mpPreference = await createCheckoutPreference({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: items.map((i) => ({
        title: `${i.name} (Talle ${i.size})`,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      shippingFee,
      payer: {
        name: custData.firstName,
        surname: custData.lastName,
        email: custData.email,
        phone: custData.phone,
      },
    })

    await prisma.payment.create({
      data: {
        orderId: order.id,
        mpPreferenceId: mpPreference.id,
        status: 'pending',
      },
    })

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      preferenceId: mpPreference.id,
      initPoint: mpPreference.initPoint,
    })
  } catch (error) {
    console.error('❌ Error creating checkout preference:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar el pedido. Por favor intentá nuevamente.' },
      { status: 500 }
    )
  }
}

class StockError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StockError'
  }
}
