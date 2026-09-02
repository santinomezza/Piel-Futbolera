import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createCheckoutPreference } from '@/lib/mercadopago'

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

export async function POST(req: Request) {
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

    // 1. Verify stock availability in DB
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
      })
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${item.name} (Talle ${item.size}). Disponible: ${variant?.stock || 0}` },
          { status: 400 }
        )
      }
    }

    // 2. Compute financial totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalAmount = subtotal + shippingFee

    // 3. Upsert Customer in DB
    const customer = await prisma.customer.create({
      data: {
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

    // Generate Order Number (DOCE-XXXX)
    const orderCount = await prisma.order.count()
    const orderNumber = `DOCE-${1000 + orderCount + 1}`

    // 4. Create Order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
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

    // 5. Generate Mercado Pago Preference
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

    // Save payment preference reference
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
