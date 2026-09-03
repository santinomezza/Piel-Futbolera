'use client'

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Search, Filter, Eye, EyeOff, Globe, Trophy, PackageCheck } from 'lucide-react'
import { ProductModal, ProductFullData, CountryItem, LeagueItem } from '@/components/admin/ProductModal'
import { Badge } from '@/components/ui/Badge'

interface ProductRecord extends ProductFullData {
  id: string
  isDeleted: boolean
  country?: CountryItem | null
  league?: LeagueItem | null
}

interface ProductsManagerClientProps {
  initialProducts: ProductRecord[]
  initialCountries: CountryItem[]
  initialLeagues: LeagueItem[]
}

export const ProductsManagerClient: React.FC<ProductsManagerClientProps> = ({
  initialProducts,
  initialCountries,
  initialLeagues,
}) => {
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts)
  const [countries, setCountries] = useState<CountryItem[]>(initialCountries)
  const [leagues, setLeagues] = useState<LeagueItem[]>(initialLeagues)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [countryFilter, setCountryFilter] = useState('ALL')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductFullData | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Refresh data from server APIs
  const refreshAllData = async () => {
    try {
      const [prodRes, countryRes, leagueRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/countries'),
        fetch('/api/admin/leagues'),
      ])

      if (prodRes.ok) {
        const prodData = await prodRes.json()
        const parsed = prodData.products.map((p: any) => {
          let images: string[] = []
          try {
            images = JSON.parse(p.images)
          } catch {
            images = [p.images]
          }
          return {
            ...p,
            images,
            variants: p.variants.map((v: any) => ({
              size: v.size,
              stock: v.stock,
            })),
          }
        })
        setProducts(parsed)
      }

      if (countryRes.ok) {
        const cData = await countryRes.json()
        setCountries(cData.countries)
      }

      if (leagueRes.ok) {
        const lData = await leagueRes.json()
        setLeagues(lData.leagues)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  // Filter products locally for table view
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.country?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.league?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter
    const matchesCountry = countryFilter === 'ALL' || p.countryId === countryFilter

    return matchesSearch && matchesCategory && matchesCountry
  })

  const handleOpenCreateModal = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (product: ProductRecord) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleSoftDelete = async (productId: string, productName: string) => {
    if (!confirm(`¿Confirmás ocultar "${productName}" de la tienda pública? Se conservará la información en la base de datos para no afectar pedidos anteriores (Soft Delete).`)) {
      return
    }

    setDeletingId(productId)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar')
      }
      await refreshAllData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al ocultar producto'
      alert(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const renderStatusBadge = (status: string) => (
    <Badge
      variant={status === 'IN_STOCK' ? 'emerald' : status === 'LOW_STOCK' ? 'amber' : 'rose'}
      size="sm"
    >
      {status === 'IN_STOCK' ? 'En Stock' : status === 'LOW_STOCK' ? 'Últimas U.' : 'Agotado'}
    </Badge>
  )

  return (
    <div className="space-y-6">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-900/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-outfit">Gestión de Catálogo de Productos</h1>
          <p className="text-xs text-ink-500 mt-1">
            Altas, ediciones y bajas (soft delete) inmediatas para la tienda pública.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-ink-900 text-xs font-bold rounded-2xl shadow-lg shadow-lime-400/30 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto Nuevo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-ink-900/10 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, liga o país..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-ink-900/10 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:border-ink-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 text-ink-500 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 sm:flex-initial bg-white border border-ink-900/10 rounded-2xl px-3 py-2 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="TITULAR">Titular</option>
              <option value="SUPLENTE">Suplente</option>
              <option value="RETRO">Retro</option>
              <option value="ARQUERO">Arquero</option>
            </select>
          </div>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="flex-1 sm:flex-initial bg-white border border-ink-900/10 rounded-2xl px-3 py-2 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
          >
            <option value="ALL">Todos los Países</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile cards */}
      {filteredProducts.length === 0 ? (
        <div className="md:hidden p-12 text-center text-ink-500 text-sm bg-white rounded-3xl border border-ink-900/10">
          No se encontraron productos en el catálogo con los filtros aplicados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredProducts.map((prod) => {
            const totalStock = prod.variants.reduce((sum, v) => sum + v.stock, 0)
            return (
              <div
                key={prod.id}
                className={`p-4 bg-white rounded-2xl border border-ink-900/10 space-y-3 ${
                  prod.isDeleted ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-cream-50 border border-ink-900/10 overflow-hidden shrink-0">
                    {prod.images[0] ? (
                      <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-500 text-[10px]">Sin imagen</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-ink-900 flex items-center gap-2 flex-wrap">
                      <span>{prod.name}</span>
                      {prod.isDeleted && (
                        <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-700 border border-rose-300 px-1.5 py-0.5 rounded">
                          Oculto
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-500 line-clamp-2 mt-0.5">{prod.description}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-ink-500 block">Categoría</span>
                    <span className="px-2 py-0.5 bg-cream-50 border border-ink-900/10 text-ink-900 rounded font-semibold inline-block mt-0.5">
                      {prod.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-500 block">Precio</span>
                    <span className="font-bold text-ink-900 font-outfit">${prod.price.toLocaleString('es-AR')}</span>
                  </div>
                  <div>
                    <span className="text-ink-500 block">País / Liga</span>
                    <div className="text-ink-900 font-semibold mt-0.5">{prod.country?.name || 'Sin país'}</div>
                    {prod.league && <div className="text-[10px] text-ink-500">{prod.league.name}</div>}
                  </div>
                  <div>
                    <span className="text-ink-500 block">Estado</span>
                    <div className="mt-1">{renderStatusBadge(prod.status)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {prod.variants.map((v) => (
                    <span
                      key={v.size}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                        v.stock === 0
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : v.stock <= 5
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-cream-50 border-ink-900/10 text-ink-700'
                      }`}
                    >
                      {v.size}: {v.stock}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-ink-900/10">
                  <button
                    onClick={() => handleOpenEditModal(prod)}
                    className="flex-1 px-3 py-2 bg-cream-50 hover:bg-cream-200 text-ink-700 rounded-lg border border-ink-900/10 transition text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  {!prod.isDeleted && (
                    <button
                      onClick={() => handleSoftDelete(prod.id, prod.name)}
                      disabled={deletingId === prod.id}
                      className="flex-1 px-3 py-2 bg-cream-50 hover:bg-rose-950 text-rose-700 rounded-lg border border-ink-900/10 transition text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block p-6 bg-white rounded-3xl border border-ink-900/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink-900/10 text-ink-500 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Producto</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">País / Liga</th>
                <th className="py-3 px-3">Precio</th>
                <th className="py-3 px-3">Stock por Talle</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/8/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-500">
                    No se encontraron productos en el catálogo con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const totalStock = prod.variants.reduce((sum, v) => sum + v.stock, 0)
                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-cream-50/50 transition ${
                        prod.isDeleted ? 'opacity-50 bg-rose-50' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-cream-50 border border-ink-900/10 overflow-hidden shrink-0">
                            {prod.images[0] ? (
                              <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-ink-500">Camiseta</div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-ink-900 flex items-center gap-2">
                              <span>{prod.name}</span>
                              {prod.isDeleted && (
                                <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-700 border border-rose-300 px-1.5 py-0.5 rounded">
                                  Oculto (Soft Deleted)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-ink-500 truncate max-w-xs">{prod.description}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 bg-cream-50 border border-ink-900/10 text-ink-700 rounded-lg font-semibold text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-ink-700 font-semibold">
                          <Globe className="w-3.5 h-3.5 text-ink-700" />
                          <span>{prod.country?.name || 'Sin país'}</span>
                        </div>
                        {prod.league && (
                          <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
                            <Trophy className="w-3 h-3 text-amber-700" />
                            <span>{prod.league.name}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-bold text-ink-900 font-outfit">
                        ${prod.price.toLocaleString('es-AR')}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {prod.variants.map((v) => (
                            <span
                              key={v.size}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                v.stock === 0
                                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                                  : v.stock <= 5
                                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                                  : 'bg-cream-50 border-ink-900/10 text-ink-700'
                              }`}
                            >
                              {v.size}: {v.stock}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-ink-500 mt-1">
                          Total: <strong className="text-ink-900">{totalStock} u.</strong>
                        </div>
                      </td>

                      <td className="py-3 px-3">{renderStatusBadge(prod.status)}</td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-2 bg-cream-50 hover:bg-cream-200 text-ink-700 rounded-2xl border border-ink-900/10 transition"
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!prod.isDeleted && (
                            <button
                              onClick={() => handleSoftDelete(prod.id, prod.name)}
                              disabled={deletingId === prod.id}
                              className="p-2 bg-cream-50 hover:bg-rose-950 text-rose-700 hover:text-rose-700 rounded-2xl border border-ink-900/10 transition"
                              title="Ocultar de la tienda (Soft delete)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshAllData}
        initialProduct={editingProduct}
        countries={countries}
        leagues={leagues}
        onRefreshMetadata={refreshAllData}
      />
    </div>
  )
}
