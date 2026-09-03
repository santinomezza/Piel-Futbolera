import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { OrdersManagerClient } from './OrdersManagerClient'

export const revalidate = 0

export default async function AdminOrdersPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session || session.value !== 'authenticated_token_pielfutbolera_admin_2026') {
    redirect('/admin/login')
  }

  const rawOrders = await prisma.order.findMany({
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

  // Serialize Date objects for React Client Component
  const orders = rawOrders.map((o: typeof rawOrders[number]) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-cream-50 text-ink-900 flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-outfit">Gestión de Pedidos & Envíos</h1>
          <p className="text-xs text-ink-500 mt-1">
            Administrá el flujo de despachos por Andreani y Correo Argentino, cambiá estados de las órdenes y asigná códigos de seguimiento.
          </p>
        </div>

        <OrdersManagerClient orders={orders} />
      </main>
    </div>
  )
}
