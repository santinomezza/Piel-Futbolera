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

  if (!session || session.value !== 'authenticated_token_doce_admin_2026') {
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
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-outfit">Dashboard de Ventas & Finanzas</h1>
            <p className="text-xs text-slate-400 mt-1">Métricas en tiempo real para DOCE Camisetas.</p>
          </div>

          {lowStockVariants.length > 0 && (
            <Link href="/admin/stock">
              <div className="px-3.5 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-semibold flex items-center gap-2 hover:bg-amber-500/20 transition">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>¡{lowStockVariants.length} variantes con bajo stock!</span>
              </div>
            </Link>
          )}
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Revenue */}
          <div className="p-6 bg-[#0F1622] rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold">Ventas Totales (Aprobadas)</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-outfit">
              ${totalSalesARS.toLocaleString('es-AR')}
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{paidOrders.length} pedidos pagados</span>
            </p>
          </div>

          {/* Card 2: Total Orders */}
          <div className="p-6 bg-[#0F1622] rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold">Cantidad de Pedidos</span>
              <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-outfit">
              {allOrders.length}
            </div>
            <p className="text-[11px] text-slate-400">Histórico de órdenes recibidas</p>
          </div>

          {/* Card 3: Ticket Promedio */}
          <div className="p-6 bg-[#0F1622] rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold">Ticket Promedio</span>
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-outfit">
              ${averageTicketARS.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[11px] text-slate-400">Promedio por orden abonada</p>
          </div>

          {/* Card 4: Pending Dispatch */}
          <div className="p-6 bg-[#0F1622] rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold">Pendientes de Despacho</span>
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                <PackageCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-outfit">
              {pendingDispatchOrders.length}
            </div>
            <p className="text-[11px] text-purple-400 font-semibold">Listos para empaquetar</p>
          </div>

        </div>

        {/* Courier Distribution & System Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="p-6 bg-[#0F1622] rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white font-outfit text-base border-b border-slate-800 pb-3">
              Desglose de Envíos por Correo
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Andreani</span>
                  <span className="text-sky-400">{andreaniCount} pedidos ({allOrders.length > 0 ? Math.round((andreaniCount / allOrders.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${allOrders.length > 0 ? (andreaniCount / allOrders.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Correo Argentino</span>
                  <span className="text-amber-400">{correoCount} pedidos ({allOrders.length > 0 ? Math.round((correoCount / allOrders.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${allOrders.length > 0 ? (correoCount / allOrders.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#0F1622] rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white font-outfit text-base border-b border-slate-800 pb-3">
              Estado de Integraciones
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Mercado Pago (Checkout Pro)</span>
                  <span className="text-slate-500">SDK + Webhook con verificación backend</span>
                </div>
                <Badge variant="emerald" size="sm">Activo</Badge>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Base de Datos PostgreSQL</span>
                  <span className="text-slate-500">Prisma ORM con esquema relacional</span>
                </div>
                <Badge variant="emerald" size="sm">Conectado</Badge>
              </div>
            </div>
          </div>

        </div>

        {/* Recent Orders Preview */}
        <div className="p-6 bg-[#0F1622] rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white font-outfit text-base">Últimos Pedidos Recibidos</h3>
            <Link href="/admin/pedidos" className="text-xs text-sky-400 font-semibold hover:underline">
              Ver Todos los Pedidos
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Orden</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Correo</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allOrders.slice(0, 5).map((order: typeof allOrders[number]) => (
                  <tr key={order.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-sky-400">{order.orderNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      {order.customer.firstName} {order.customer.lastName}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{order.courier}</td>
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
                    <td className="py-3 px-3 font-bold text-slate-100 font-outfit">
                      ${order.totalAmount.toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
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
