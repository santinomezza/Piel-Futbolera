'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, X, Trash2, Plus, Minus, ShieldCheck } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/Button'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore()
  const subtotal = getSubtotal()
  const totalItems = getTotalItems()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream-50 border-l border-ink-900/10 shadow-2xl flex flex-col">

          <div className="p-6 border-b border-ink-900/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ink-900 text-lime-400 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-ink-900 font-outfit">Mi Carrito</h2>
                <p className="text-xs text-ink-500">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-ink-700 hover:text-ink-900 rounded-full hover:bg-ink-100 transition"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-5 bg-white rounded-full text-ink-300 border border-ink-900/10">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-ink-900 font-bold">Tu carrito está vacío</p>
                  <p className="text-xs text-ink-500 max-w-xs mt-1">
                    Explorá nuestro catálogo de camisetas titulares, suplentes, retro y de arquero.
                  </p>
                </div>
                <Button variant="primary" size="md" onClick={onClose}>
                  Ver Catálogo
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="p-3.5 bg-white rounded-2xl border border-ink-900/8 flex gap-3.5 items-center group transition hover:border-ink-900/20 hover:shadow-sm"
                >
                  <div className="relative w-16 h-20 bg-cream-100 rounded-2xl overflow-hidden shrink-0 border border-ink-900/8">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-ink-900 truncate">{item.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-ink-900 text-cream-50 rounded-full">
                        {item.size}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-ink-900/15 rounded-full bg-cream-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-1 text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-ink-900 min-w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-2.5 py-1 text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-black text-ink-900 font-outfit">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="p-1.5 text-ink-500 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-ink-900/10 bg-white space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-ink-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-ink-900">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-xs text-ink-500">
                  <span>Envío</span>
                  <span>Calculado en el checkout</span>
                </div>
                <div className="pt-2 border-t border-ink-900/8 flex justify-between text-lg font-black text-ink-900 font-outfit">
                  <span>Total</span>
                  <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-ink-500 bg-lime-50 p-3 rounded-2xl border border-lime-200">
                <ShieldCheck className="w-4 h-4 text-lime-600 shrink-0" />
                <span>Pago 100% protegido con Mercado Pago.</span>
              </div>

              <Link href="/checkout" onClick={onClose} className="block w-full">
                <Button variant="primary" size="lg" className="w-full">
                  Finalizar Compra
                </Button>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
