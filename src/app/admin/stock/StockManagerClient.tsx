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
    category: string
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

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-[#0F1622] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-900/60">
              <th className="py-3.5 px-4">Camiseta</th>
              <th className="py-3.5 px-4">Categoría</th>
              <th className="py-3.5 px-4">Talle</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">Stock Actual</th>
              <th className="py-3.5 px-4">Alerta</th>
              <th className="py-3.5 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {initialVariants.map((variant) => {
              const currentStock = stockMap[variant.id]
              const isLowStock = currentStock <= 5

              return (
                <tr key={variant.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-100">{variant.product.name}</td>
                  <td className="py-3 px-4 text-slate-400">{variant.product.category}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {variant.size}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{variant.sku}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      value={currentStock}
                      onChange={(e) => handleStockChange(variant.id, e.target.value)}
                      className="w-20 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg font-bold text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    {currentStock === 0 ? (
                      <Badge variant="rose" size="sm">Agotado</Badge>
                    ) : isLowStock ? (
                      <Badge variant="amber" size="sm">Bajo Stock (&le;5)</Badge>
                    ) : (
                      <Badge variant="emerald" size="sm">OK ({currentStock})</Badge>
                    )}
                  </td>
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
  )
}
