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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-ink-900/10">
        <div className="flex flex-wrap items-center gap-3">

          <div>
            <label className="block text-[10px] uppercase font-bold text-ink-500 mb-1">Filtrar por Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-cream-50 border border-ink-900/10 text-xs text-ink-900 rounded-2xl px-3 py-2 focus:ring-1 focus:ring-lime-400 focus:outline-none"
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
            <label className="block text-[10px] uppercase font-bold text-ink-500 mb-1">Filtrar por Correo</label>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="bg-cream-50 border border-ink-900/10 text-xs text-ink-900 rounded-2xl px-3 py-2 focus:ring-1 focus:ring-lime-400 focus:outline-none"
            >
              <option value="ALL">Todos los Correos</option>
              <option value="ANDREANI">Andreani</option>
              <option value="CORREO_ARGENTINO">Correo Argentino</option>
            </select>
          </div>

        </div>

        <div className="text-xs text-ink-500">
          Mostrando <strong>{filteredOrders.length}</strong> de {orders.length} pedidos
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-ink-900/10 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono font-bold text-sm text-ink-700">{order.orderNumber}</div>
                <div className="font-semibold text-sm text-ink-900 mt-1">
                  {order.customer.firstName} {order.customer.lastName}
                </div>
                <div className="text-[11px] text-ink-500 truncate">{order.customer.email}</div>
              </div>
              <div className="text-right shrink-0">
                {renderStatusBadge(order.status)}
                <div className="text-base font-bold text-ink-900 font-outfit mt-2">
                  ${order.totalAmount.toLocaleString('es-AR')}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-ink-500 pt-2 border-t border-ink-900/10">
              <span>{order.courier}</span>
              <span className="font-mono">{order.trackingCode || 'Sin asignar'}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveModalOrder(order)}
                className="flex-1 px-3 py-2 bg-cream-50 hover:bg-cream-200 text-ink-900 rounded-lg border border-ink-900/10 transition text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver detalle
              </button>
              <button
                onClick={() => handleOpenStatusModal(order)}
                className="flex-1 px-3 py-2 bg-ink-900/5 hover:bg-ink-900/5 text-ink-700 rounded-lg border border-ink-900/10 transition text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Cambiar estado
              </button>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-ink-500 text-sm bg-white rounded-2xl border border-ink-900/10">
            No hay pedidos que coincidan con los filtros.
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-3xl border border-ink-900/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink-900/10 text-ink-500 uppercase text-[10px] tracking-wider bg-cream-50/60">
                <th className="py-3.5 px-4">Orden</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Correo</th>
                <th className="py-3.5 px-4">Seguimiento</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/8/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-cream-50/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-ink-700">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink-900">{order.customer.firstName} {order.customer.lastName}</div>
                    <div className="text-[11px] text-ink-500">{order.customer.email}</div>
                  </td>
                  <td className="py-3 px-4 text-ink-700">{order.courier}</td>
                  <td className="py-3 px-4 font-mono text-xs text-ink-500">
                    {order.trackingCode || <span className="text-ink-500">Sin asignar</span>}
                  </td>
                  <td className="py-3 px-4">{renderStatusBadge(order.status)}</td>
                  <td className="py-3 px-4 font-bold text-ink-900 font-outfit">
                    ${order.totalAmount.toLocaleString('es-AR')}
                  </td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setActiveModalOrder(order)}
                      className="p-2 bg-cream-50 hover:bg-cream-200 text-ink-700 rounded-lg border border-ink-900/10 transition"
                      title="Ver detalle del pedido"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenStatusModal(order)}
                      className="p-2 bg-ink-900/5 hover:bg-ink-900/5 text-ink-700 rounded-lg border border-ink-900/10 transition"
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
        <div className="fixed inset-0 z-50 bg-cream-50/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-ink-900/10 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-ink-900/10 pb-3">
              <h3 className="text-lg font-bold text-ink-900 font-outfit">
                Detalle del Pedido <span className="text-ink-700 font-mono">{activeModalOrder.orderNumber}</span>
              </h3>
              <button onClick={() => setActiveModalOrder(null)} className="text-ink-500 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-cream-50 rounded-2xl space-y-1">
                <span className="font-bold text-ink-900 block mb-1">Comprador</span>
                <p>{activeModalOrder.customer.firstName} {activeModalOrder.customer.lastName}</p>
                <p className="text-ink-500 break-all">{activeModalOrder.customer.email}</p>
                <p className="text-ink-500">{activeModalOrder.customer.phone}</p>
              </div>

              <div className="p-3 bg-cream-50 rounded-2xl space-y-1">
                <span className="font-bold text-ink-900 block mb-1">Dirección de Entrega</span>
                <p>{activeModalOrder.customer.address}</p>
                <p className="text-ink-500">{activeModalOrder.customer.city} ({activeModalOrder.customer.postalCode})</p>
                <p className="text-ink-700 font-semibold">{activeModalOrder.courier}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-ink-900">Productos:</span>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {activeModalOrder.items.map((i) => (
                  <div key={i.id} className="p-2.5 bg-cream-50/60 rounded-2xl border border-ink-900/10 flex justify-between text-xs">
                    <span>{i.variant.product.name} (Talle {i.variant.size}) x{i.quantity}</span>
                    <span className="font-bold text-ink-900">${(i.unitPrice * i.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-ink-900/10 flex justify-between items-center text-xs">
              <span className="text-ink-500">Total acumulado:</span>
              <span className="text-base font-bold text-ink-700 font-outfit">
                ${activeModalOrder.totalAmount.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {updatingOrder && (
        <div className="fixed inset-0 z-50 bg-cream-50/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-ink-900/10 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-ink-900/10 pb-3">
              <h3 className="text-base font-bold text-ink-900 font-outfit">
                Cambiar Estado de {updatingOrder.orderNumber}
              </h3>
              <button onClick={() => setUpdatingOrder(null)} className="text-ink-500 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Estado del Pedido</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-cream-50 border border-ink-900/10 text-xs text-ink-900 rounded-2xl px-3 py-2.5 focus:ring-1 focus:ring-lime-400 focus:outline-none"
                >
                  <option value="PENDING">PENDING (Pendiente)</option>
                  <option value="PAID">PAID (Pagado)</option>
                  <option value="SHIPPED">SHIPPED (Enviado / Despachado)</option>
                  <option value="DELIVERED">DELIVERED (Entregado)</option>
                  <option value="CANCELLED">CANCELLED (Cancelado)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Código de Seguimiento ({updatingOrder.courier})</label>
                <input
                  type="text"
                  value={newTrackingCode}
                  onChange={(e) => setNewTrackingCode(e.target.value)}
                  placeholder="ej. AND-987654321"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-ink-900/10 rounded-2xl text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
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
