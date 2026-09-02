'use client'

import React, { useState, useEffect } from 'react'
import { X, Upload, Plus, Trash2, Image as ImageIcon, Check, Loader2 } from 'lucide-react'

export interface CountryItem {
  id: string
  name: string
  code?: string | null
}

export interface LeagueItem {
  id: string
  name: string
  countryId: string
  color?: string | null
  logoUrl?: string | null
}

export interface ProductVariantItem {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL'
  stock: number
}

export interface ProductFullData {
  id?: string
  name: string
  description: string
  price: number
  category: 'TITULAR' | 'SUPLENTE' | 'RETRO' | 'ARQUERO'
  badge?: string | null
  countryId: string
  leagueId?: string | null
  images: string[]
  featured: boolean
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  variants: ProductVariantItem[]
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialProduct?: ProductFullData | null
  countries: CountryItem[]
  leagues: LeagueItem[]
  onRefreshMetadata: () => Promise<void>
}

const DEFAULT_SIZES: Array<'S' | 'M' | 'L' | 'XL' | 'XXL'> = ['S', 'M', 'L', 'XL', 'XXL']

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
  countries,
  leagues,
  onRefreshMetadata,
}) => {
  const [formData, setFormData] = useState<ProductFullData>({
    name: '',
    description: '',
    price: 45000,
    category: 'TITULAR',
    badge: '',
    countryId: '',
    leagueId: '',
    images: [],
    featured: false,
    status: 'IN_STOCK',
    variants: DEFAULT_SIZES.map((size) => ({ size, stock: 10 })),
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Inline Country Creation State
  const [showNewCountryModal, setShowNewCountryModal] = useState(false)
  const [newCountryName, setNewCountryName] = useState('')
  const [creatingCountry, setCreatingCountry] = useState(false)

  // Inline League Creation State
  const [showNewLeagueModal, setShowNewLeagueModal] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState('')
  const [newLeagueColor, setNewLeagueColor] = useState('#00A3E0')
  const [creatingLeague, setCreatingLeague] = useState(false)

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        ...initialProduct,
        badge: initialProduct.badge || '',
        leagueId: initialProduct.leagueId || '',
        variants: DEFAULT_SIZES.map((size) => {
          const found = initialProduct.variants?.find((v) => v.size === size)
          return { size, stock: found ? found.stock : 0 }
        }),
      })
    } else {
      const defaultCountry = countries[0]?.id || ''
      const filteredLeagues = leagues.filter((l) => l.countryId === defaultCountry)
      setFormData({
        name: '',
        description: '',
        price: 45999,
        category: 'TITULAR',
        badge: '',
        countryId: defaultCountry,
        leagueId: filteredLeagues[0]?.id || '',
        images: [],
        featured: false,
        status: 'IN_STOCK',
        variants: DEFAULT_SIZES.map((size) => ({ size, stock: 10 })),
      })
    }
    setErrorMsg('')
  }, [initialProduct, isOpen, countries, leagues])

  if (!isOpen) return null

  const availableLeaguesForCountry = leagues.filter((l) => l.countryId === formData.countryId)

  // Handle Country Selection
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === '__NEW_COUNTRY__') {
      setShowNewCountryModal(true)
      return
    }
    const filtered = leagues.filter((l) => l.countryId === value)
    setFormData((prev) => ({
      ...prev,
      countryId: value,
      leagueId: filtered[0]?.id || '',
    }))
  }

  // Handle League Selection
  const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === '__NEW_LEAGUE__') {
      setShowNewLeagueModal(true)
      return
    }
    setFormData((prev) => ({
      ...prev,
      leagueId: value === '__NONE__' ? '' : value,
    }))
  }

  // Create Country Inline
  const handleCreateCountryInline = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCountryName.trim()) return
    setCreatingCountry(true)
    try {
      const res = await fetch('/api/admin/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCountryName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear país')
      }
      await onRefreshMetadata()
      setFormData((prev) => ({
        ...prev,
        countryId: data.country.id,
        leagueId: '',
      }))
      setNewCountryName('')
      setShowNewCountryModal(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear país'
      alert(msg)
    } finally {
      setCreatingCountry(false)
    }
  }

  // Create League Inline
  const handleCreateLeagueInline = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeagueName.trim()) return
    if (!formData.countryId) {
      alert('Debes seleccionar un país antes de agregar una liga.')
      return
    }
    setCreatingLeague(true)
    try {
      const res = await fetch('/api/admin/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeagueName.trim(),
          countryId: formData.countryId,
          color: newLeagueColor,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear liga')
      }
      await onRefreshMetadata()
      setFormData((prev) => ({
        ...prev,
        leagueId: data.league.id,
      }))
      setNewLeagueName('')
      setShowNewLeagueModal(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear liga'
      alert(msg)
    } finally {
      setCreatingLeague(false)
    }
  }

  // Handle Multi Image File Selection with Preview & Upload
  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setErrorMsg('')
    try {
      const dataForm = new FormData()
      Array.from(files).forEach((file) => dataForm.append('files', file))

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: dataForm,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir imágenes')

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...data.urls],
      }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir imágenes'
      setErrorMsg(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }))
  }

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.name.trim()) return setErrorMsg('El nombre es obligatorio')
    if (!formData.description.trim()) return setErrorMsg('La descripción es obligatoria')
    if (formData.price <= 0) return setErrorMsg('El precio debe ser positivo')
    if (!formData.countryId) return setErrorMsg('Debes seleccionar un país')
    if (formData.images.length === 0) return setErrorMsg('Debes cargar al menos 1 imagen')

    setSaving(true)
    try {
      const url = initialProduct?.id
        ? `/api/admin/products/${initialProduct.id}`
        : '/api/admin/products'

      const method = initialProduct?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          leagueId: formData.leagueId || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el producto')
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el producto'
      setErrorMsg(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0F2418] border border-emerald-900 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-emerald-900 bg-[#0A1A12]">
          <div>
            <h2 className="text-lg font-bold text-white font-outfit">
              {initialProduct?.id ? 'Editar Producto' : 'Alta de Producto Nuevo'}
            </h2>
            <p className="text-xs text-slate-400">
              {initialProduct?.id
                ? 'Modificá la información y stock que se muestran en la tienda pública.'
                : 'Cargá los detalles del producto para publicarlo al instante.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-emerald-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300">Nombre del Producto *</label>
              <input
                type="text"
                required
                placeholder="ej: Camiseta Albiceleste Titular 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#141C2B] border border-emerald-900 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Precio (ARS $) *</label>
              <input
                type="number"
                required
                min="1"
                step="100"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#141C2B] border border-emerald-900 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-[#141C2B] border border-emerald-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="TITULAR">Camiseta Titular</option>
                <option value="SUPLENTE">Camiseta Suplente</option>
                <option value="RETRO">Edición Retro</option>
                <option value="ARQUERO">Equipación Arquero</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Descripción del Producto *</label>
            <textarea
              required
              rows={3}
              placeholder="Detalles sobre materiales, tejido, escudos y confección..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#141C2B] border border-emerald-900 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Country & League with Inline Creation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#121927] border border-emerald-900/80 rounded-2xl">
            {/* Country Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300">País *</label>
                <button
                  type="button"
                  onClick={() => setShowNewCountryModal(true)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Crear País</span>
                </button>
              </div>
              <select
                value={formData.countryId}
                onChange={handleCountryChange}
                className="w-full bg-[#141C2B] border border-emerald-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="" disabled>Seleccionar País</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
                <option value="__NEW_COUNTRY__" className="text-emerald-400 font-bold">
                  + Crear Nuevo País...
                </option>
              </select>
            </div>

            {/* League Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300">Liga (Opcional para Selección)</label>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.countryId) {
                      alert('Primero elegí un país')
                      return
                    }
                    setShowNewLeagueModal(true)
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Crear Liga</span>
                </button>
              </div>
              <select
                value={formData.leagueId || '__NONE__'}
                onChange={handleLeagueChange}
                className="w-full bg-[#141C2B] border border-emerald-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="__NONE__">Sin Liga / Selección Nacional</option>
                {availableLeaguesForCountry.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
                <option value="__NEW_LEAGUE__" className="text-emerald-400 font-bold">
                  + Crear Nueva Liga en este país...
                </option>
              </select>
            </div>
          </div>

          {/* Status & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Estado de Disponibilidad</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#141C2B] border border-emerald-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="IN_STOCK">En Stock</option>
                <option value="LOW_STOCK">Últimas Unidades</option>
                <option value="OUT_OF_STOCK">Agotado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Etiqueta Visual / Badge (Opcional)</label>
              <input
                type="text"
                placeholder="ej: NUEVO, RETRO, POPULAR, DESTACADO"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full bg-[#141C2B] border border-emerald-900 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Stock Per Size Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Stock Disponible por Talle *</label>
            <div className="grid grid-cols-5 gap-3">
              {formData.variants.map((v, index) => (
                <div key={v.size} className="p-3 bg-[#121927] border border-emerald-900 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-black text-emerald-400 block">{v.size}</span>
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => {
                      const newStock = parseInt(e.target.value) || 0
                      const updatedVariants = [...formData.variants]
                      updatedVariants[index].stock = newStock
                      setFormData({ ...formData, variants: updatedVariants })
                    }}
                    className="w-full bg-[#1A2333] border border-emerald-800 rounded-xl py-1 px-2 text-center text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Images Upload & Previews */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Imágenes del Producto (Subida a Almacenamiento con Preview) *
            </label>

            {/* Image Upload Area */}
            <div className="relative border-2 border-dashed border-emerald-900 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition bg-[#121927]/50 group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFilesUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition" />
                )}
                <p className="text-xs font-semibold text-slate-300">
                  {uploading ? 'Subiendo imágenes...' : 'Hacé clic o arrastrá archivos de imagen aquí'}
                </p>
                <p className="text-[11px] text-slate-500">Formatos JPG, PNG, WebP (Máx 5MB por imagen)</p>
              </div>
            </div>

            {/* Image Preview Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {formData.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-2xl overflow-hidden border border-emerald-900 bg-emerald-950"
                  >
                    <img
                      src={imgUrl}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg transition"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer / Submit */}
          <div className="pt-4 border-t border-emerald-900 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-slate-300 text-xs font-semibold rounded-xl transition border border-emerald-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{initialProduct?.id ? 'Guardar Cambios' : 'Publicar Producto'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Inline Create Country Sub-Modal */}
      {showNewCountryModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-emerald-900 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-emerald-900 pb-3">
              <h3 className="text-sm font-bold text-white">Agregar Nuevo País</h3>
              <button onClick={() => setShowNewCountryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCountryInline} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Nombre del País *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Alemania, Francia, Colombia"
                  value={newCountryName}
                  onChange={(e) => setNewCountryName(e.target.value)}
                  className="w-full bg-[#1A2333] border border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCountryModal(false)}
                  className="px-4 py-2 bg-emerald-950 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingCountry}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  {creatingCountry ? 'Guardando...' : 'Crear País'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Create League Sub-Modal */}
      {showNewLeagueModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-emerald-900 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-emerald-900 pb-3">
              <h3 className="text-sm font-bold text-white">Agregar Nueva Liga</h3>
              <button onClick={() => setShowNewLeagueModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLeagueInline} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Nombre de la Liga *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Bundesliga, Serie A, MLS"
                  value={newLeagueName}
                  onChange={(e) => setNewLeagueName(e.target.value)}
                  className="w-full bg-[#1A2333] border border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Color Distintivo (Opcional)</label>
                <input
                  type="color"
                  value={newLeagueColor}
                  onChange={(e) => setNewLeagueColor(e.target.value)}
                  className="w-full h-10 bg-[#1A2333] border border-emerald-800 rounded-xl p-1 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewLeagueModal(false)}
                  className="px-4 py-2 bg-emerald-950 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingLeague}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  {creatingLeague ? 'Guardando...' : 'Crear Liga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
