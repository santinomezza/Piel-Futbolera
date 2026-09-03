'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/useCartStore'
import { ShoppingBag, Check, ShieldCheck, Truck, ArrowLeft, Minus, Plus, Ruler, Award } from 'lucide-react'

interface Variant {
  id: string
  size: string
  stock: number
  sku: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  badge: string | null
  images: string[]
  variants: Variant[]
}

interface ProductDetailViewProps {
  product: Product
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants.find((v) => v.stock > 0)?.size || ''
  )
  const [quantity, setQuantity] = useState<number>(1)
  const [activeImage, setActiveImage] = useState<string>(product.images[0] || '')
  const [addedMessage, setAddedMessage] = useState<string | null>(null)

  const addItemToCart = useCartStore((state) => state.addItem)

  const activeVariant = product.variants.find((v) => v.size === selectedSize)
  const isOutOfStock = !activeVariant || activeVariant.stock === 0

  const handleAddToCart = () => {
    if (!activeVariant || isOutOfStock) return
    const success = addItemToCart({
      variantId: activeVariant.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      size: activeVariant.size,
      image: activeImage,
      stock: activeVariant.stock,
      sku: activeVariant.sku,
      quantity,
    })
    if (success) {
      setAddedMessage(`¡Camiseta agregada al carrito! (${selectedSize} x ${quantity})`)
    } else {
      setAddedMessage('No podés agregar más unidades de las disponibles.')
    }
    setTimeout(() => setAddedMessage(null), 3500)
  }

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'TITULAR': return 'Titular'
      case 'SUPLENTE': return 'Suplente'
      case 'RETRO': return 'Retro'
      case 'ARQUERO': return 'Arquero'
      default: return cat
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-ink-500 hover:text-ink-900 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-cream-100 rounded-3xl overflow-hidden border-2 border-ink-900">
            <Image src={activeImage} alt={product.name} fill priority className="object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="ink" size="sm">{getCategoryLabel(product.category)}</Badge>
              {product.badge && <Badge variant="primary" size="sm">{product.badge}</Badge>}
            </div>
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-24 bg-cream-100 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img ? 'border-ink-900' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Vista ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] font-black text-ink-500">
              {getCategoryLabel(product.category)} · {product.variants.length} talles
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-ink-900 font-outfit leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-black text-ink-900 font-outfit">
              ${product.price.toLocaleString('es-AR')}
            </p>
          </div>

          <p className="text-sm text-ink-500 leading-relaxed border-y border-ink-900/8 py-5">
            {product.description}
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-ink-500">Talle</span>
              {activeVariant && (
                <span className={`text-xs font-bold ${activeVariant.stock > 0 ? 'text-ink-700' : 'text-rose-500'}`}>
                  {activeVariant.stock > 0 ? `${activeVariant.stock} disponibles` : 'Sin stock'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                const variant = product.variants.find((v) => v.size === size)
                const hasStock = variant && variant.stock > 0
                const isSelected = selectedSize === size

                return (
                  <button
                    key={size}
                    onClick={() => {
                      if (hasStock) {
                        setSelectedSize(size)
                        setQuantity(1)
                      }
                    }}
                    disabled={!hasStock}
                    className={`py-3 rounded-full font-black text-sm border-2 transition ${
                      isSelected
                        ? 'bg-ink-900 text-lime-400 border-ink-900'
                        : hasStock
                        ? 'bg-white text-ink-900 border-ink-900/10 hover:border-ink-900'
                        : 'bg-cream-100 text-ink-300 border-ink-900/5 cursor-not-allowed line-through'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-ink-500">Cantidad</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-ink-900/10 rounded-full bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3.5 py-2.5 text-ink-500 hover:text-ink-900 disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 font-black text-sm text-ink-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!activeVariant || quantity >= activeVariant.stock || isOutOfStock}
                  className="px-3.5 py-2.5 text-ink-500 hover:text-ink-900 disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs text-ink-500">
                Total: <strong className="text-ink-900 font-black">${(product.price * quantity).toLocaleString('es-AR')}</strong>
              </span>
            </div>
          </div>

          {addedMessage && (
            <div className="p-3 bg-lime-100 border border-lime-300 rounded-2xl text-xs font-bold text-lime-800 flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{addedMessage}</span>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="w-full py-4 text-base"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{isOutOfStock ? 'Talle Sin Stock' : 'Agregar al Carrito'}</span>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-ink-900/8">
            <div className="p-3.5 bg-white rounded-2xl border border-ink-900/8 flex items-center gap-3">
              <div className="w-9 h-9 bg-lime-400 rounded-full flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-ink-900" />
              </div>
              <div>
                <p className="text-xs font-black text-ink-900">Envío 24/48h</p>
                <p className="text-[11px] text-ink-500">Andreani & Correo Arg</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-ink-900/8 flex items-center gap-3">
              <div className="w-9 h-9 bg-ink-900 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-lime-400" />
              </div>
              <div>
                <p className="text-xs font-black text-ink-900">Pago Seguro</p>
                <p className="text-[11px] text-ink-500">Mercado Pago oficial</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-ink-900/8 flex items-center gap-3">
              <div className="w-9 h-9 bg-ink-900 rounded-full flex items-center justify-center shrink-0">
                <Ruler className="w-4 h-4 text-lime-400" />
              </div>
              <div>
                <p className="text-xs font-black text-ink-900">Talles Reales</p>
                <p className="text-[11px] text-ink-500">S a XXL</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-ink-900/8 flex items-center gap-3">
              <div className="w-9 h-9 bg-lime-400 rounded-full flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-ink-900" />
              </div>
              <div>
                <p className="text-xs font-black text-ink-900">Calidad Premium</p>
                <p className="text-[11px] text-ink-500">Tela deportiva</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
