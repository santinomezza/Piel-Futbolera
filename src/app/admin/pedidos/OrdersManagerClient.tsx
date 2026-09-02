'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Eye, Edit3, X, Check, Download, Truck, Package } from 'lucide-react'

export interface OrderItemWithDetails {
  id: string
  quantity: number
  unitPrice: number
  variant: {
    size: string
    product: {
      name: string
    }
  }
}

export interface OrderWithCustomer {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  courier: string
  trackingCode: string | null
  shippingAddress: string
  createdAt: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  items: OrderItemWithDetails[]
}

interface OrdersManagerClientProps {
  orders: OrderWithCustomer[]
}

export const OrdersManagerClient: React.FC<OrdersManagerClientProps> = ({ orders: initialOrders }) => {
  const [orders, setOrders] = useState<OrderWithCustomer[]>(initialOrders)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedCourier, setSelectedCourier] = useState<string>('ALL')
  const [activeModalOrder, setActiveModalOrder] = useState<OrderWithCustomer | null>(null)
  
  // Status update modal state
  const [updatingOrder, setUpdatingOrder] = useState<OrderWithCustomer | null>(null)
  const [newStatus, setNewStatus] = useState<string>('SHIPPED')
  const [newTrackingCode, setNewTrackingCode] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus
    const matchesCourier = selectedCourier === 'ALL' || o.courier === selectedCourier
    return matchesStatus && matchesCourier
  })

  const handleOpenStatusModal = (order: OrderWithCustomer) => {
    setUpdatingOrder(order)
    setNewStatus(order.status === 'PAID' ? 'SHIPPED' : order.status)
    setNewTrackingCode(order.trackingCode || '')
  }

  const handleSaveStatus = async () => {
    if (!updatingOrder) return
    setIsUpdating(true)

    try {
      const res = await fetch('/api/admin/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: updatingOrder.id,
          status: newStatus,
          trackingCode: newTrackingCode,
        }),
      })

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === updatingOrder.id
              ? { ...o, status: newStatus, trackingCode: newTrackingCode || o.trackingCode }
              : o
          )
        )
        setUpdatingOrder(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  const renderStatusBadge = (status: string) => (
    <Badge
      variant={
        status === 'PAID' || status === 'DELIVERED'
          ? 'emerald'
          : status === 'SHIPPED'
          ? 'primary'
          : status === 'PENDING'
          ? 'amber'
          : 'rose'
      }
      size="sm"
    >
      {status}
    </Badge>
  )

  return (
    <div className="space-y-6">

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F2418] p-4 rounded-2xl border border-emerald-900">
        <div className="flex flex-wrap items-center gap-3">

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filtrar por Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-emerald-950 border border-emerald-900 text-xs text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="PENDING">Pendiente de Pago</option>
              <option value="PAID">Pagado (Aprobado)</option>
              <option value="SHIPPED">Enviado (Despachado)</option>
              <option value="DELIVERED">Entregado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filtrar por Correo</label>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="bg-emerald-950 border border-emerald-900 text-xs text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Todos los Correos</option>
              <option value="ANDREANI">Andreani</option>
              <option value="CORREO_ARGENTINO">Correo Argentino</option>
            </select>
          </div>

        </div>

        <div className="text-xs text-slate-400">
          Mostrando <strong>{filteredOrders.length}</strong> de {orders.length} pedidos
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-[#0F2418] rounded-2xl border border-emerald-900 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono font-bold text-sm text-emerald-400">{order.orderNumber}</div>
                <div className="font-semibold text-sm text-slate-100 mt-1">
                  {order.customer.firstName} {order.customer.lastName}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{order.customer.email}</div>
              </div>
              <div className="text-right shrink-0">
                {renderStatusBadge(order.status)}
                <div className="text-base font-bold text-slate-100 font-outfit mt-2">
                  ${order.totalAmount.toLocaleString('es-AR')}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-emerald-900">
              <span>{order.courier}</span>
              <span className="font-mono">{order.trackingCode || 'Sin asignar'}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveModalOrder(order)}
                className="flex-1 px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-slate-200 rounded-lg border border-emerald-900 transition text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver detalle
              </button>
              <button
                onClick={() => handleOpenStatusModal(order)}
                className="flex-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Cambiar estado
              </button>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm bg-[#0F2418] rounded-2xl border border-emerald-900">
            No hay pedidos que coincidan con los filtros.
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-[#0F2418] rounded-3xl border border-emerald-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900 text-slate-400 uppercase text-[10px] tracking-wider bg-emerald-950/60">
                <th className="py-3.5 px-4">Orden</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Correo</th>
                <th className="py-3.5 px-4">Seguimiento</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-emerald-950/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{order.customer.firstName} {order.customer.lastName}</div>
                    <div className="text-[11px] text-slate-400">{order.customer.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{order.courier}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-400">
                    {order.trackingCode || <span className="text-slate-600">Sin asignar</span>}
                  </td>
                  <td className="py-3 px-4">{renderStatusBadge(order.status)}</td>
                  <td className="py-3 px-4 font-bold text-slate-100 font-outfit">
                    ${order.totalAmount.toLocaleString('es-AR')}
                  </td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setActiveModalOrder(order)}
                      className="p-2 bg-emerald-950 hover:bg-emerald-900 text-slate-300 rounded-lg border border-emerald-900 transition"
                      title="Ver detalle del pedido"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenStatusModal(order)}
                      className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition"
                      title="Actualizar estado / seguimiento"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 bg-emerald-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F2418] rounded-3xl border border-emerald-900 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-900 pb-3">
              <h3 className="text-lg font-bold text-white font-outfit">
                Detalle del Pedido <span className="text-emerald-400 font-mono">{activeModalOrder.orderNumber}</span>
              </h3>
              <button onClick={() => setActiveModalOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-emerald-950 rounded-xl space-y-1">
                <span className="font-bold text-slate-200 block mb-1">Comprador</span>
                <p>{activeModalOrder.customer.firstName} {activeModalOrder.customer.lastName}</p>
                <p className="text-slate-400 break-all">{activeModalOrder.customer.email}</p>
                <p className="text-slate-400">{activeModalOrder.customer.phone}</p>
              </div>

              <div className="p-3 bg-emerald-950 rounded-xl space-y-1">
                <span className="font-bold text-slate-200 block mb-1">Dirección de Entrega</span>
                <p>{activeModalOrder.customer.address}</p>
                <p className="text-slate-400">{activeModalOrder.customer.city} ({activeModalOrder.customer.postalCode})</p>
                <p className="text-emerald-400 font-semibold">{activeModalOrder.courier}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200">Productos:</span>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {activeModalOrder.items.map((i) => (
                  <div key={i.id} className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-900 flex justify-between text-xs">
                    <span>{i.variant.product.name} (Talle {i.variant.size}) x{i.quantity}</span>
                    <span className="font-bold text-slate-100">${(i.unitPrice * i.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-900 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total acumulado:</span>
              <span className="text-base font-bold text-emerald-400 font-outfit">
                ${activeModalOrder.totalAmount.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {updatingOrder && (
        <div className="fixed inset-0 z-50 bg-emerald-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F2418] rounded-3xl border border-emerald-900 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-900 pb-3">
              <h3 className="text-base font-bold text-white font-outfit">
                Cambiar Estado de {updatingOrder.orderNumber}
              </h3>
              <button onClick={() => setUpdatingOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado del Pedido</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-emerald-950 border border-emerald-900 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="PENDING">PENDING (Pendiente)</option>
                  <option value="PAID">PAID (Pagado)</option>
                  <option value="SHIPPED">SHIPPED (Enviado / Despachado)</option>
                  <option value="DELIVERED">DELIVERED (Entregado)</option>
                  <option value="CANCELLED">CANCELLED (Cancelado)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Código de Seguimiento ({updatingOrder.courier})</label>
                <input
                  type="text"
                  value={newTrackingCode}
                  onChange={(e) => setNewTrackingCode(e.target.value)}
                  placeholder="ej. AND-987654321"
                  className="w-full px-3.5 py-2.5 bg-emerald-950 border border-emerald-900 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setUpdatingOrder(null)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button variant="primary" size="sm" isLoading={isUpdating} onClick={handleSaveStatus} className="w-full sm:w-auto">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
