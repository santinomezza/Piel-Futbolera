'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Check, AlertTriangle, Save } from 'lucide-react'

interface Variant {
  id: string
  size: string
  stock: number
  sku: string
  product: {
    name: string
    category?: {
      name: string
      section?: { name: string } | null
    } | null
  }
}

interface StockManagerClientProps {
  variants: Variant[]
}

export const StockManagerClient: React.FC<StockManagerClientProps> = ({ variants: initialVariants }) => {
  const [stockMap, setStockMap] = useState<Record<string, number>>(
    initialVariants.reduce((acc, v) => ({ ...acc, [v.id]: v.stock }), {})
  )
  const [savingId, setSavingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleStockChange = (variantId: string, value: string) => {
    const num = parseInt(value, 10)
    setStockMap((prev) => ({ ...prev, [variantId]: isNaN(num) ? 0 : Math.max(0, num) }))
  }

  const saveStock = async (variantId: string) => {
    setSavingId(variantId)
    setFeedback(null)

    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, newStock: stockMap[variantId] }),
      })

      if (res.ok) {
        setFeedback(`Stock actualizado a ${stockMap[variantId]} unidades.`)
        setTimeout(() => setFeedback(null), 3000)
      } else {
        setFeedback('Error al guardar stock.')
      }
    } catch {
      setFeedback('Error de conexión.')
    } finally {
      setSavingId(null)
    }
  }

  const renderBadge = (currentStock: number) => {
    if (currentStock === 0) return <Badge variant="rose" size="sm">Agotado</Badge>
    if (currentStock <= 5) return <Badge variant="amber" size="sm">Bajo (&le;5)</Badge>
    return <Badge variant="emerald" size="sm">OK ({currentStock})</Badge>
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 bg-ink-900/5 border border-ink-900/10 rounded-2xl text-ink-700 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Mobile cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {initialVariants.map((variant) => {
          const currentStock = stockMap[variant.id]
          return (
            <div
              key={variant.id}
              className="bg-white rounded-2xl border border-ink-900/10 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-ink-900 truncate">{variant.product.name}</h3>
                  <p className="text-[11px] text-ink-500 mt-0.5">
                    {variant.product.category?.section?.name ? `${variant.product.category.section.name} · ` : ''}
                    {variant.product.category?.name || 'Sin categoría'}
                  </p>
                </div>
                <span className="font-bold text-ink-700 bg-cream-50 px-2 py-0.5 rounded border border-ink-900/10 text-xs shrink-0">
                  {variant.size}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-ink-500">{variant.sku}</span>
                {renderBadge(currentStock)}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-ink-500 shrink-0">Stock:</label>
                <input
                  type="number"
                  min="0"
                  value={currentStock}
                  onChange={(e) => handleStockChange(variant.id, e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-cream-50 border border-ink-900/10 rounded-lg font-bold text-ink-900 text-sm focus:ring-1 focus:ring-lime-400 focus:outline-none"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={savingId === variant.id}
                  onClick={() => saveStock(variant.id)}
                >
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-3xl border border-ink-900/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink-900/10 text-ink-500 uppercase text-[10px] tracking-wider bg-cream-50/60">
                <th className="py-3.5 px-4">Camiseta</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Talle</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Stock Actual</th>
                <th className="py-3.5 px-4">Alerta</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/8/60">
              {initialVariants.map((variant) => {
                const currentStock = stockMap[variant.id]

                return (
                  <tr key={variant.id} className="hover:bg-cream-50/40 transition">
                    <td className="py-3 px-4 font-semibold text-ink-900">{variant.product.name}</td>
                    <td className="py-3 px-4 text-ink-500">
                      <div>{variant.product.category?.section?.name || '—'}</div>
                      <div className="text-[10px] text-ink-500">{variant.product.category?.name || 'Sin categoría'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-ink-700 bg-cream-50 px-2 py-0.5 rounded border border-ink-900/10">
                        {variant.size}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-500">{variant.sku}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={currentStock}
                        onChange={(e) => handleStockChange(variant.id, e.target.value)}
                        className="w-20 px-2.5 py-1 bg-cream-50 border border-ink-900/10 rounded-lg font-bold text-ink-900 text-xs focus:ring-1 focus:ring-lime-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-4">{renderBadge(currentStock)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={savingId === variant.id}
                        onClick={() => saveStock(variant.id)}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
