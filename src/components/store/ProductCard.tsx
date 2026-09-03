'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export interface SerializedProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  badge: string | null
  images: string[]
  variants: {
    id: string
    size: string
    stock: number
  }[]
}

interface ProductCardProps {
  product: SerializedProduct
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0)
  const isLowStock = totalStock > 0 && totalStock <= 10
  const isSoldOut = totalStock === 0

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'TITULAR': return 'Titular'
      case 'SUPLENTE': return 'Suplente'
      case 'RETRO': return 'Retro'
      case 'ARQUERO': return 'Arquero'
      default: return cat
    }
  }

  const mainImage = product.images[0] || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80'

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group relative block bg-cream-50 rounded-2xl border border-ink-900/8 hover:border-ink-900/20 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(10,10,10,0.15)]"
    >
      <div className="relative aspect-[4/5] bg-cream-100 overflow-hidden">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />

        <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex justify-between items-start gap-1 z-10">
          <Badge variant="ink" size="sm" className="text-[9px] sm:text-[10px]">
            {getCategoryLabel(product.category)}
          </Badge>
          {product.badge && (
            <Badge variant="primary" size="sm" className="text-[9px] sm:text-[10px]">
              {product.badge}
            </Badge>
          )}
        </div>

        {isSoldOut && (
          <div className="absolute inset-0 bg-cream-50/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="secondary" size="md">Agotado</Badge>
          </div>
        )}

        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hidden sm:block">
          <div className="w-10 h-10 bg-ink-900 text-lime-400 rounded-full flex items-center justify-center shadow-lg">
            <Plus className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
        <h3 className="font-bold text-ink-900 text-sm sm:text-lg font-outfit leading-tight line-clamp-1 group-hover:text-ink-700 transition">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-ink-500 line-clamp-1 sm:line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="pt-2 sm:pt-3 border-t border-ink-900/8 flex items-center justify-between">
          <div>
            <span className="hidden sm:block text-[10px] uppercase font-bold text-ink-500 tracking-wider">Precio</span>
            <span className="text-base sm:text-xl font-black text-ink-900 font-outfit">
              ${product.price.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="text-right">
            {!isSoldOut && !isLowStock && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-ink-500">
                <span className="w-1.5 h-1.5 bg-lime-500 rounded-full" />
                <span className="hidden sm:inline">En stock</span>
                <span className="sm:hidden">OK</span>
              </span>
            )}
            {isLowStock && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-700">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                <span className="hidden sm:inline">¡Últimas {totalStock}!</span>
                <span className="sm:hidden">¡{totalStock}!</span>
              </span>
            )}
            {isSoldOut && (
              <span className="text-[10px] sm:text-xs font-bold text-ink-500">Sin stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
