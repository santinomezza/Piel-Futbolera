'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShippingQuote } from '@/lib/shipping'
import { Truck, ShieldCheck, CreditCard, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()
  const subtotal = getSubtotal()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [mounted, setMounted] = useState(false)

  // Form State
  const [customer, setCustomer] = useState({
    email: '',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    address: '',
    city: '',
    province: 'CABA',
    postalCode: '',
  })

  // Shipping & Payment state
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([])
  const [selectedCourier, setSelectedCourier] = useState<ShippingQuote | null>(null)
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (mounted && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-50">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-ink-900 font-outfit">Tu carrito está vacío</h1>
          <p className="text-sm text-ink-500">Agregá alguna camiseta al carrito antes de proceder al checkout.</p>
          <Link href="/">
            <Button variant="primary" size="md">Ver Catálogo</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  // Handle Step 1 -> Step 2 transition & fetch shipping quotes
  const handleProceedToShipping = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!customer.email || !customer.firstName || !customer.lastName || !customer.dni || !customer.address || !customer.postalCode) {
      setErrorMsg('Por favor completá todos los campos obligatorios.')
      return
    }

    setIsLoadingQuotes(true)
    try {
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postalCode: customer.postalCode }),
      })
      const data = await res.json()

      if (res.ok && data.quotes?.length > 0) {
        setShippingQuotes(data.quotes)
        setSelectedCourier(data.quotes[0])
        setStep(2)
      } else {
        setErrorMsg('No pudimos cotizar envíos para este código postal. Verificá el código ingresado.')
      }
    } catch {
      setErrorMsg('Error de conexión al cotizar el envío.')
    } finally {
      setIsLoadingQuotes(false)
    }
  }

  // Handle Step 3 Order Creation -> Mercado Pago Preference
  const handleCreateOrderAndPay = async () => {
    if (!selectedCourier) return
    setIsSubmittingOrder(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/checkout/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items: items.map((i) => ({
            variantId: i.variantId,
            productId: i.productId,
            name: i.name,
            size: i.size,
            price: i.price,
            quantity: i.quantity,
          })),
          courier: selectedCourier.courierId,
          shippingFee: selectedCourier.price,
        }),
      })

      const data = await res.json()

      if (res.ok && data.initPoint) {
        // Clear cart on successful order preference creation
        clearCart()
        // Redirect to official Mercado Pago Checkout Pro
        window.location.href = data.initPoint
      } else {
        setErrorMsg(data.error || 'Ocurrió un error al procesar el pedido.')
      }
    } catch {
      setErrorMsg('Error de comunicación con el servidor de pago.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const shippingFee = selectedCourier ? selectedCourier.price : 0
  const totalAmount = subtotal + shippingFee

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Progress Tracker */}
        <div className="max-w-xl mx-auto flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cream-200 -z-10 -translate-y-1/2" />
          
          <div className={`flex flex-col items-center gap-1 bg-cream-50 px-3 ${step >= 1 ? 'text-ink-900 font-bold' : 'text-ink-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-lime-400 text-ink-900 shadow-md shadow-lime-400/30' : 'bg-cream-200 text-ink-500'}`}>
              1
            </div>
            <span className="text-[11px]">Datos de Envío</span>
          </div>

          <div className={`flex flex-col items-center gap-1 bg-cream-50 px-3 ${step >= 2 ? 'text-ink-900 font-bold' : 'text-ink-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-lime-400 text-ink-900 shadow-md shadow-lime-400/30' : 'bg-cream-200 text-ink-500'}`}>
              2
            </div>
            <span className="text-[11px]">Método de Envío</span>
          </div>

          <div className={`flex flex-col items-center gap-1 bg-cream-50 px-3 ${step === 3 ? 'text-ink-900 font-bold' : 'text-ink-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step === 3 ? 'bg-lime-400 text-ink-900 shadow-md shadow-lime-400/30' : 'bg-cream-200 text-ink-500'}`}>
              3
            </div>
            <span className="text-[11px]">Pago Mercado Pago</span>
          </div>
        </div>

        {errorMsg && (
          <div className="max-w-4xl mx-auto p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Step Content */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-ink-900/10 shadow-xl space-y-6">
            
            {/* STEP 1: Address details */}
            {step === 1 && (
              <form onSubmit={handleProceedToShipping} className="space-y-4">
                <h2 className="text-xl font-bold text-ink-900 font-outfit border-b border-ink-900/10 pb-3">
                  1. Datos del Comprador y Domicilio
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={customer.firstName}
                      onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                      placeholder="Juan"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-ink-900/10 rounded-2xl text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Apellido *</label>
                    <input
                      type="text"
                      required
                      value={customer.lastName}
                      onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                      placeholder="Pérez"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-ink-900/10 rounded-2xl text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="juan@ejemplo.com"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-ink-900/10 rounded-2xl text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">DNI (para el envío) *</label>
                    <input
                      type="text"
                      required
                      value={customer.dni}
                      onChange={(e) => setCustomer({ ...customer, dni: e.target.value })}
                      placeholder="38123456"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-ink-900/10 rounded-2xl text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Teléfono *</label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="1198765432"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-ink-900/10 rounded-2xl text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Código Postal *</label>
                    <input
                      type="text"
                      required
                      value={customer.postalCode}
                      onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                      placeholder="C1043 o 1425"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-ink-900/10 rounded-2xl text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Calle y Altura (Piso / Dpto) *</label>
                    <input
                      type="text"
                      required
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      placeholder="Av. Corrientes 1234 4to B"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-ink-900/10 rounded-2xl text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Ciudad *</label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="Buenos Aires"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-ink-900/10 rounded-2xl text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>
                </div>

                <Button variant="primary" size="lg" isLoading={isLoadingQuotes} className="w-full mt-4">
                  Continuar a Selección de Envío
                </Button>
              </form>
            )}

            {/* STEP 2: Courier selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-ink-900/10 pb-3">
                  <h2 className="text-xl font-bold text-ink-900 font-outfit">
                    2. Seleccionar Empresa de Correo
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-ink-700 hover:underline"
                  >
                    Modificar datos
                  </button>
                </div>

                <p className="text-xs text-ink-500">
                  Cotización en tiempo real para el Código Postal <strong className="text-ink-700">{customer.postalCode}</strong>:
                </p>

                <div className="space-y-3">
                  {shippingQuotes.map((quote) => (
                    <div
                      key={quote.courierId}
                      onClick={() => setSelectedCourier(quote)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        selectedCourier?.courierId === quote.courierId
                          ? 'bg-ink-900/5 border-ink-900 shadow-md shadow-ink-900/5'
                          : 'bg-cream-50 border-ink-900/10 hover:border-ink-900/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCourier?.courierId === quote.courierId ? 'border-ink-900 bg-zinc-100' : 'border-slate-600'}`}>
                          {selectedCourier?.courierId === quote.courierId && (
                            <div className="w-2 h-2 rounded-full bg-cream-50" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-ink-900">{quote.courierName}</span>
                            <Badge variant={quote.courierId === 'ANDREANI' ? 'primary' : 'amber'} size="sm">
                              {quote.serviceType}
                            </Badge>
                          </div>
                          <p className="text-xs text-ink-500 mt-0.5">{quote.description}</p>
                          <span className="text-[11px] text-ink-700 font-semibold mt-1 block">
                            Tiempo estimado: {quote.estimatedDays}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-ink-900 font-outfit">
                          ${quote.price.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button variant="outline" size="md" onClick={() => setStep(1)}>
                    Atrás
                  </Button>
                  <Button variant="primary" size="lg" onClick={() => setStep(3)} className="flex-1">
                    Continuar al Pago
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment confirmation */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-ink-900/10 pb-3">
                  <h2 className="text-xl font-bold text-ink-900 font-outfit">
                    3. Pago con Mercado Pago
                  </h2>
                  <button onClick={() => setStep(2)} className="text-xs text-ink-700 hover:underline">
                    Cambiar envío
                  </button>
                </div>

                <div className="p-4 bg-cream-100 rounded-2xl border border-ink-900/10 space-y-3 text-xs">
                  <div className="flex justify-between text-ink-700">
                    <span>Comprador:</span>
                    <strong className="text-ink-900">{customer.firstName} {customer.lastName} ({customer.email})</strong>
                  </div>
                  <div className="flex justify-between text-ink-700">
                    <span>Domicilio:</span>
                    <strong className="text-ink-900">{customer.address}, {customer.city} ({customer.postalCode})</strong>
                  </div>
                  <div className="flex justify-between text-ink-700">
                    <span>Envío por:</span>
                    <strong className="text-ink-700">{selectedCourier?.courierName} (${selectedCourier?.price.toLocaleString('es-AR')})</strong>
                  </div>
                </div>

                <div className="p-4 bg-ink-900/5 border border-ink-900/10 rounded-2xl text-xs text-ink-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-ink-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Checkout Pro Oficial de Mercado Pago</span>
                  </div>
                  <p className="leading-relaxed text-ink-500">
                    Al hacer clic en "Pagar con Mercado Pago", serás redirigido de forma segura a Mercado Pago para abonar con tarjeta de crédito, débito o dinero en cuenta.
                  </p>
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  isLoading={isSubmittingOrder}
                  onClick={handleCreateOrderAndPay}
                  className="w-full py-4 text-base shadow-xl"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Pagar ${totalAmount.toLocaleString('es-AR')} con Mercado Pago</span>
                </Button>
              </div>
            )}

          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-ink-900/10 space-y-4">
            <h3 className="font-bold text-lg text-ink-900 font-outfit border-b border-ink-900/10 pb-3">
              Resumen del Pedido
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 items-center">
                  <div className="relative w-12 h-14 bg-cream-50 rounded-lg overflow-hidden shrink-0 border border-ink-900/10">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-ink-700 truncate">{item.name}</h4>
                    <span className="text-[11px] text-ink-500">Talle {item.size} x {item.quantity}</span>
                  </div>
                  <span className="text-xs font-bold text-ink-700">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-ink-900/10 space-y-2 text-xs">
              <div className="flex justify-between text-ink-500">
                <span>Subtotal productos</span>
                <span className="font-semibold text-ink-700">${subtotal.toLocaleString('es-AR')}</span>
              </div>

              <div className="flex justify-between text-ink-500">
                <span>Envío ({selectedCourier ? selectedCourier.courierName : 'A calcular'})</span>
                <span className="font-semibold text-ink-700">
                  {selectedCourier ? `$${selectedCourier.price.toLocaleString('es-AR')}` : '-'}
                </span>
              </div>

              <div className="pt-3 border-t border-ink-900/10 flex justify-between text-base font-bold text-ink-900">
                <span>Total Final</span>
                <span className="text-ink-700 font-outfit">${totalAmount.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  )
}
