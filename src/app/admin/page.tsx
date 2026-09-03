import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Badge } from '@/components/ui/Badge'
import { DollarSign, ShoppingBag, Truck, AlertTriangle, TrendingUp, PackageCheck } from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session || session.value !== 'authenticated_token_pielfutbolera_admin_2026') {
    redirect('/admin/login')
  }

  // Fetch KPI data from Prisma
  const allOrders = await prisma.order.findMany({
    include: {
      customer: true,
      items: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const paidOrders = allOrders.filter((o: typeof allOrders[number]) => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED')
  const pendingDispatchOrders = allOrders.filter((o: typeof allOrders[number]) => o.status === 'PAID')

  const totalSalesARS = paidOrders.reduce((sum: number, o: typeof paidOrders[number]) => sum + o.totalAmount, 0)
  const averageTicketARS = paidOrders.length > 0 ? totalSalesARS / paidOrders.length : 0

  // Courier Breakdown
  const andreaniCount = allOrders.filter((o: typeof allOrders[number]) => o.courier === 'ANDREANI').length
  const correoCount = allOrders.filter((o: typeof allOrders[number]) => o.courier === 'CORREO_ARGENTINO').length

  // Low stock variants alert count
  const lowStockVariants = await prisma.productVariant.findMany({
    where: { stock: { lte: 5 } },
    include: { product: true },
  })

  return (
    <div className="min-h-screen bg-cream-50 text-ink-900 flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink-900 font-outfit">Dashboard de Ventas & Finanzas</h1>
            <p className="text-xs text-ink-500 mt-1">Métricas en tiempo real para PielFutbolera.</p>
          </div>

          {lowStockVariants.length > 0 && (
            <Link href="/admin/stock">
              <div className="px-3.5 py-2 bg-amber-50 border border-amber-300 rounded-2xl text-amber-700 text-xs font-semibold flex items-center gap-2 hover:bg-amber-50 transition">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>¡{lowStockVariants.length} variantes con bajo stock!</span>
              </div>
            </Link>
          )}
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Revenue */}
          <div className="p-6 bg-white rounded-3xl border border-ink-900/10 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-ink-500">
              <span className="text-xs font-semibold">Ventas Totales (Aprobadas)</span>
              <div className="p-2 bg-ink-900/5 rounded-2xl text-ink-700">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-ink-900 font-outfit">
              ${totalSalesARS.toLocaleString('es-AR')}
            </div>
            <p className="text-[11px] text-ink-700 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{paidOrders.length} pedidos pagados</span>
            </p>
          </div>

          {/* Card 2: Total Orders */}
          <div className="p-6 bg-white rounded-3xl border border-ink-900/10 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-ink-500">
              <span className="text-xs font-semibold">Cantidad de Pedidos</span>
              <div className="p-2 bg-ink-900/5 rounded-2xl text-ink-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-ink-900 font-outfit">
              {allOrders.length}
            </div>
            <p className="text-[11px] text-ink-500">Histórico de órdenes recibidas</p>
          </div>

          {/* Card 3: Ticket Promedio */}
          <div className="p-6 bg-white rounded-3xl border border-ink-900/10 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-ink-500">
              <span className="text-xs font-semibold">Ticket Promedio</span>
              <div className="p-2 bg-amber-50 rounded-2xl text-amber-700">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-ink-900 font-outfit">
              ${averageTicketARS.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[11px] text-ink-500">Promedio por orden abonada</p>
          </div>

          {/* Card 4: Pending Dispatch */}
          <div className="p-6 bg-white rounded-3xl border border-ink-900/10 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-ink-500">
              <span className="text-xs font-semibold">Pendientes de Despacho</span>
              <div className="p-2 bg-purple-50 rounded-2xl text-purple-700">
                <PackageCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-ink-900 font-outfit">
              {pendingDispatchOrders.length}
            </div>
            <p className="text-[11px] text-purple-700 font-semibold">Listos para empaquetar</p>
          </div>

        </div>

        {/* Courier Distribution & System Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="p-6 bg-white rounded-3xl border border-ink-900/10 space-y-4">
            <h3 className="font-bold text-ink-900 font-outfit text-base border-b border-ink-900/10 pb-3">
              Desglose de Envíos por Correo
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-ink-700">Andreani</span>
                  <span className="text-ink-700">{andreaniCount} pedidos ({allOrders.length > 0 ? Math.round((andreaniCount / allOrders.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-cream-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime-400 rounded-full transition-all"
                    style={{ width: `${allOrders.length > 0 ? (andreaniCount / allOrders.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-ink-700">Correo Argentino</span>
                  <span className="text-amber-700">{correoCount} pedidos ({allOrders.length > 0 ? Math.round((correoCount / allOrders.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-cream-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${allOrders.length > 0 ? (correoCount / allOrders.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-ink-900/10 space-y-4">
            <h3 className="font-bold text-ink-900 font-outfit text-base border-b border-ink-900/10 pb-3">
              Estado de Integraciones
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-cream-50 rounded-2xl border border-ink-900/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink-900 block">Mercado Pago (Checkout Pro)</span>
                  <span className="text-ink-500">SDK + Webhook con verificación backend</span>
                </div>
                <Badge variant="emerald" size="sm">Activo</Badge>
              </div>

              <div className="p-3 bg-cream-50 rounded-2xl border border-ink-900/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink-900 block">Base de Datos PostgreSQL</span>
                  <span className="text-ink-500">Prisma ORM con esquema relacional</span>
                </div>
                <Badge variant="emerald" size="sm">Conectado</Badge>
              </div>
            </div>
          </div>

        </div>

        {/* Recent Orders Preview */}
        <div className="p-6 bg-white rounded-3xl border border-ink-900/10 space-y-4">
          <div className="flex justify-between items-center border-b border-ink-900/10 pb-3">
            <h3 className="font-bold text-ink-900 font-outfit text-base">Últimos Pedidos Recibidos</h3>
            <Link href="/admin/pedidos" className="text-xs text-ink-700 font-semibold hover:underline">
              Ver Todos los Pedidos
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ink-900/10 text-ink-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Orden</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Correo</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/8/60">
                {allOrders.slice(0, 5).map((order: typeof allOrders[number]) => (
                  <tr key={order.id} className="hover:bg-cream-50/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-ink-700">{order.orderNumber}</td>
                    <td className="py-3 px-3 font-semibold text-ink-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </td>
                    <td className="py-3 px-3 text-ink-700">{order.courier}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          order.status === 'PAID'
                            ? 'emerald'
                            : order.status === 'SHIPPED'
                            ? 'primary'
                            : order.status === 'PENDING'
                            ? 'amber'
                            : 'rose'
                        }
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-bold text-ink-900 font-outfit">
                      ${order.totalAmount.toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-3 text-ink-500">
                      {new Date(order.createdAt).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}
