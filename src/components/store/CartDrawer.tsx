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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-900/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111622] border-l border-zinc-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-xl text-zinc-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Mi Carrito</h2>
                <p className="text-xs text-slate-400">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-zinc-800 transition"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-4 bg-zinc-900 rounded-full text-slate-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <p className="text-slate-300 font-medium">Tu carrito está vacío</p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Explorá nuestro catálogo de camisetas titulares, suplentes, retro y de arquero.
                </p>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Ver Catálogo
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="p-3.5 bg-[#182030] rounded-xl border border-zinc-800 flex gap-3.5 items-center group transition hover:border-zinc-700"
                >
                  <div className="relative w-16 h-20 bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">{item.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md">
                        Talle: {item.size}
                      </span>
                      <span className="text-xs text-slate-400">SKU: {item.sku}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity selector */}
                      <div className="flex items-center border border-zinc-700 rounded-lg bg-zinc-900/60 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2 py-1 text-slate-400 hover:text-slate-100 hover:bg-zinc-800 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-slate-200">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-2 py-1 text-slate-400 hover:text-slate-100 hover:bg-zinc-800 transition disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-100">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                    title="Eliminar ítem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-[#141B29] space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-200">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Envío</span>
                  <span>Calculado en el checkout</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-base font-bold text-slate-100">
                  <span>Total estimado</span>
                  <span className="text-zinc-300">${subtotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-zinc-300 shrink-0" />
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
