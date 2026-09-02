'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/useCartStore'
import { ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react'

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
      setTimeout(() => setAddedMessage(null), 3500)
    } else {
      setAddedMessage(`No podés agregar más unidades de las disponibles en stock.`)
      setTimeout(() => setAddedMessage(null), 3500)
    }
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
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-emerald-950 rounded-3xl overflow-hidden border border-emerald-900 shadow-2xl">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="primary">{getCategoryLabel(product.category)}</Badge>
              {product.badge && <Badge variant="gold">{product.badge}</Badge>}
            </div>
          </div>

          {/* Thumbnail list if multiple images exist */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-24 bg-emerald-950 rounded-xl overflow-hidden border-2 transition ${
                    activeImage === img ? 'border-emerald-500 shadow-md shadow-emerald-500/20' : 'border-emerald-900 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Vista ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Variant Selector */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white font-outfit leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-emerald-400 font-outfit">
              ${product.price.toLocaleString('es-AR')}
            </p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed border-t border-b border-emerald-900/80 py-4">
            {product.description}
          </p>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400">Seleccionar Talle</span>
              {activeVariant && (
                <span className={`font-semibold ${activeVariant.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeVariant.stock > 0 ? `${activeVariant.stock} unidades en stock` : 'Sin Stock'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2.5">
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
                    className={`py-3 rounded-xl font-bold text-sm border transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                        : hasStock
                        ? 'bg-emerald-950 hover:bg-emerald-900 text-slate-200 border-emerald-900 hover:border-emerald-800'
                        : 'bg-emerald-950 text-slate-600 border-emerald-900 cursor-not-allowed opacity-40 line-through'
                    }`}
                  >
                    <span>{size}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Cantidad</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-emerald-900 rounded-xl bg-emerald-950 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3.5 py-2 text-slate-400 hover:text-white hover:bg-emerald-900 disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-4 font-bold text-sm text-slate-100">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!activeVariant || quantity >= activeVariant.stock || isOutOfStock}
                  className="px-3.5 py-2 text-slate-400 hover:text-white hover:bg-emerald-900 disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <span className="text-xs text-slate-400">
                Total: <strong className="text-slate-200">${(product.price * quantity).toLocaleString('es-AR')}</strong>
              </span>
            </div>
          </div>

          {/* Toast Notification */}
          {addedMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{addedMessage}</span>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            variant="primary"
            size="lg"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="w-full py-4 text-base shadow-xl"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{isOutOfStock ? 'Talle Sin Stock' : 'Agregar al Carrito'}</span>
          </Button>

          {/* Value props */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-900 text-xs text-slate-400">
            <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-900 flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cotización real de envíos por Andreani & Correo Arg.</span>
            </div>
            <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-900 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pago oficial con Mercado Pago.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
