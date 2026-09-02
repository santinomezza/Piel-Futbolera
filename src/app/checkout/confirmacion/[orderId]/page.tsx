import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Clock, XCircle, Truck, Package, Home } from 'lucide-react'

interface ConfirmationPageProps {
  params: Promise<{
    orderId: string
  }>
  searchParams: Promise<{
    status?: string
  }>
}

export const revalidate = 0

export default async function OrderConfirmationPage({ params, searchParams }: ConfirmationPageProps) {
  const { orderId } = await params
  const resolvedSearchParams = await searchParams
  const mpStatus = resolvedSearchParams.status

  const order = await prisma.order.findUnique({
    where: { id: orderId },
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
      payments: true,
      shipments: true,
    },
  })

  if (!order) {
    notFound()
  }

  let addressData: any = {}
  try {
    addressData = JSON.parse(order.shippingAddress)
  } catch {
    addressData = {}
  }

  // Determine display status
  const isApproved = order.status === 'PAID' || mpStatus === 'approved'
  const isPending = order.status === 'PENDING' || mpStatus === 'pending'
  const isRejected = mpStatus === 'rejected'

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Status Header Banner */}
        <div className="text-center space-y-4 bg-[#141B28] p-8 rounded-3xl border border-slate-800 shadow-xl">
          {isApproved ? (
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : isPending ? (
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
              <Clock className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          <div>
            <h1 className="text-3xl font-extrabold text-white font-outfit">
              {isApproved
                ? '¡Gracias por tu compra!'
                : isPending
                ? 'Pago Pendiente de Acreditación'
                : 'Pago No Completado'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Número de Orden: <strong className="text-sky-400 font-mono">{order.orderNumber}</strong>
            </p>
          </div>

          <div className="pt-2">
            {isApproved ? (
              <Badge variant="emerald" size="md">Pago Aprobado y Confirmado</Badge>
            ) : isPending ? (
              <Badge variant="amber" size="md">Aguardando Confirmación de Mercado Pago</Badge>
            ) : (
              <Badge variant="rose" size="md">Pago Rechazado o Cancelado</Badge>
            )}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Shipping & Customer Details */}
          <div className="bg-[#141B28] p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-200 border-b border-slate-800 pb-3 text-sm">
              <Truck className="w-4 h-4 text-sky-400" />
              <span>Datos del Envío ({order.courier})</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p><strong>Comprador:</strong> {order.customer.firstName} {order.customer.lastName}</p>
              <p><strong>Email:</strong> {order.customer.email}</p>
              <p><strong>Teléfono:</strong> {order.customer.phone}</p>
              <p><strong>Domicilio:</strong> {addressData.address || order.customer.address}, {addressData.city || order.customer.city} ({addressData.postalCode || order.customer.postalCode})</p>
              
              {order.trackingCode && (
                <div className="pt-3 border-t border-slate-800 bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
                  <span className="text-[11px] uppercase font-bold text-sky-400 block">Código de Seguimiento {order.courier}:</span>
                  <span className="font-mono font-bold text-sm text-white">{order.trackingCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-[#141B28] p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-200 border-b border-slate-800 pb-3 text-sm">
              <Package className="w-4 h-4 text-sky-400" />
              <span>Resumen Financiero</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal productos:</span>
                <span className="text-slate-200">${order.subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Costo de envío:</span>
                <span className="text-slate-200">${order.shippingFee.toLocaleString('es-AR')}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                <span>Total Abonado:</span>
                <span className="text-sky-400 font-outfit">${order.totalAmount.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Itemized List */}
        <div className="bg-[#141B28] p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 text-sm">
            Productos en la Orden
          </h3>

          <div className="space-y-3">
            {order.items.map((item: typeof order.items[number]) => {
              let imgs: string[] = []
              try {
                imgs = JSON.parse(item.variant.product.images)
              } catch {
                imgs = [item.variant.product.images]
              }
              const mainImg = imgs[0] || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80'

              return (
                <div key={item.id} className="flex gap-4 items-center p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <div className="relative w-14 h-16 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                    <Image src={mainImg} alt={item.variant.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-slate-100">{item.variant.product.name}</h4>
                    <span className="text-xs text-slate-400">Talle: <strong>{item.variant.size}</strong> | Cantidad: {item.quantity}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-200 font-outfit">
                    ${(item.unitPrice * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/">
            <Button variant="primary" size="lg">
              <Home className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </Button>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}
