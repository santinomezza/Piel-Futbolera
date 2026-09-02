'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Eye } from 'lucide-react'

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
    <div className="group relative bg-[#0F2418] rounded-xl sm:rounded-2xl border border-emerald-900/80 hover:border-emerald-500/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between">

      {/* Top Image Container */}
      <div className="relative aspect-[4/5] bg-emerald-950 overflow-hidden">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex justify-between items-start gap-1 z-10 pointer-events-none">
          <Badge variant="primary" size="sm" className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5">
            <span className="sm:hidden">{product.category === 'ARQUERO' ? 'Arq.' : getCategoryLabel(product.category).split(' ')[0]}</span>
            <span className="hidden sm:inline">{getCategoryLabel(product.category)}</span>
          </Badge>

          {product.badge && (
            <Badge variant={product.badge === 'RETRO' ? 'gold' : 'amber'} size="sm" className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5">
              {product.badge}
            </Badge>
          )}
        </div>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
          <Link
            href={`/producto/${product.slug}`}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Detalle</span>
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-3">
        <div>
          <Link href={`/producto/${product.slug}`} className="block">
            <h3 className="font-semibold text-slate-100 text-xs sm:text-base group-hover:text-emerald-400 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Stock & Price */}
        <div className="pt-2 sm:pt-3 border-t border-emerald-900/80 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <span className="hidden sm:block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Precio</span>
            <span className="text-sm sm:text-lg font-bold text-slate-100 font-outfit">
              ${product.price.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="text-right shrink-0">
            {totalStock > 0 ? (
              <span className={`text-[9px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md ${isLowStock ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <span className="sm:hidden">{isLowStock ? `¡${totalStock}!` : 'Stock'}</span>
                <span className="hidden sm:inline">{isLowStock ? `¡Solo ${totalStock} disponibles!` : 'Stock disponible'}</span>
              </span>
            ) : (
              <span className="text-[9px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400">
                Agotado
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
