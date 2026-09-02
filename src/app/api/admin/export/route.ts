import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Phone',
      'Address',
      'City',
      'Province',
      'Postal Code',
      'Status',
      'Courier',
      'Tracking Code',
      'Subtotal ARS',
      'Shipping Fee ARS',
      'Total Amount ARS',
      'Items Summary',
    ]

    const rows = orders.map((o: typeof orders[number]) => {
      const itemsSummary = o.items
        .map((i: typeof o.items[number]) => `${i.variant.product.name} (${i.variant.size}) x${i.quantity}`)
        .join(' | ')

      return [
        o.orderNumber,
        o.createdAt.toISOString().split('T')[0],
        `"${o.customer.firstName} ${o.customer.lastName}"`,
        `"${o.customer.email}"`,
        `"${o.customer.phone}"`,
        `"${o.customer.address}"`,
        `"${o.customer.city}"`,
        `"${o.customer.province}"`,
        `"${o.customer.postalCode}"`,
        o.status,
        o.courier,
        `"${o.trackingCode || ''}"`,
        o.subtotal.toFixed(2),
        o.shippingFee.toFixed(2),
        o.totalAmount.toFixed(2),
        `"${itemsSummary}"`,
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="DOCE_Ventas_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('❌ CSV export error:', error)
    return NextResponse.json({ error: 'Error exportando ventas a CSV' }, { status: 500 })
  }
}
