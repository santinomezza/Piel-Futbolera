'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Trash2, Edit2, FolderTree, X, Save, Layers } from 'lucide-react'

interface CategoryData {
  id: string
  slug: string
  name: string
  description: string | null
  order: number
  sectionId: string
  _count: { products: number }
}

interface SectionData {
  id: string
  slug: string
  name: string
  description: string | null
  order: number
  imageUrl: string | null
  categories: CategoryData[]
}

interface CatalogManagerProps {
  initialSections: SectionData[]
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({ initialSections }) => {
  const [sections, setSections] = useState<SectionData[]>(initialSections)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(initialSections[0]?.id ?? null)
  const [saving, setSaving] = useState(false)

  const [newSection, setNewSection] = useState({ name: '', slug: '', description: '' })
  const [newCategory, setNewCategory] = useState<{ sectionId: string; name: string; slug: string; description: string } | null>(null)

  const reload = async () => {
    const res = await fetch('/api/admin/sections', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      // Hydrate categories
      const catPromises = data.sections.map(async (s: SectionData) => {
        const cr = await fetch(`/api/admin/categories?sectionId=${s.id}`, { cache: 'no-store' })
        const cd = cr.ok ? await cr.json() : { categories: [] }
        return { ...s, categories: cd.categories }
      })
      const merged = await Promise.all(catPromises)
      setSections(merged)
    }
  }

  const createSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSection.name || !newSection.slug) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSection.name,
          slug: newSection.slug,
          description: newSection.description || null,
          order: sections.length + 1,
        }),
      })
      if (res.ok) {
        setNewSection({ name: '', slug: '', description: '' })
        await reload()
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteSection = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la sección "${name}" y todas sus categorías? Los productos quedarán sin categoría.`)) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/sections/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setActiveSectionId((prev) => (prev === id ? null : prev))
        await reload()
      }
    } finally {
      setSaving(false)
    }
  }

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory || !newCategory.name || !newCategory.slug) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      })
      if (res.ok) {
        setNewCategory(null)
        await reload()
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"? Los productos en ella quedarán sin categoría.`)) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (res.ok) await reload()
    } finally {
      setSaving(false)
    }
  }

  const activeSection = sections.find((s) => s.id === activeSectionId) || null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* === Sections panel === */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl border border-ink-900/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-ink-900 text-lime-400 rounded-full flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-ink-900 font-outfit">Secciones</h2>
              <p className="text-[11px] text-ink-500">Top-level del catálogo</p>
            </div>
          </div>

          <div className="space-y-2">
            {sections.map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  activeSectionId === s.id
                    ? 'bg-ink-900 text-cream-50 border-ink-900'
                    : 'bg-cream-50 border-ink-900/10 hover:border-ink-900/30'
                }`}
              >
                <button
                  onClick={() => setActiveSectionId(s.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="font-bold text-sm truncate">{s.name}</p>
                  <p className={`text-[10px] uppercase tracking-wider ${activeSectionId === s.id ? 'text-lime-400' : 'text-ink-500'}`}>
                    {s.slug} · {s.categories.length} {s.categories.length === 1 ? 'cat.' : 'cats.'}
                  </p>
                </button>
                <button
                  onClick={() => deleteSection(s.id, s.name)}
                  className={`p-1.5 rounded-lg transition ${activeSectionId === s.id ? 'hover:bg-white/10 text-cream-50/60 hover:text-rose-300' : 'text-ink-500 hover:text-rose-500'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {sections.length === 0 && (
              <p className="text-xs text-ink-500 text-center py-3">No hay secciones todavía.</p>
            )}
          </div>

          <form onSubmit={createSection} className="mt-4 pt-4 border-t border-ink-900/10 space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-black text-ink-500">Nueva sección</p>
            <input
              type="text"
              placeholder="Nombre (ej. Camisetas)"
              value={newSection.name}
              onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
              className="w-full px-3 py-2 bg-cream-50 border border-ink-900/10 rounded-full text-xs focus:outline-none focus:border-ink-900"
            />
            <input
              type="text"
              placeholder="slug (ej. camisetas)"
              value={newSection.slug}
              onChange={(e) => setNewSection({ ...newSection, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              className="w-full px-3 py-2 bg-cream-50 border border-ink-900/10 rounded-full text-xs font-mono focus:outline-none focus:border-ink-900"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={newSection.description}
              onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
              className="w-full px-3 py-2 bg-cream-50 border border-ink-900/10 rounded-full text-xs focus:outline-none focus:border-ink-900"
            />
            <Button type="submit" variant="primary" size="sm" isLoading={saving} className="w-full">
              <Plus className="w-3.5 h-3.5" />
              Crear Sección
            </Button>
          </form>
        </div>
      </div>

      {/* === Categories panel === */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl border border-ink-900/10 p-5">
          {activeSection ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-lime-400 text-ink-900 rounded-full flex items-center justify-center">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h2 className="font-black text-ink-900 font-outfit">Categorías de {activeSection.name}</h2>
                  <p className="text-[11px] text-ink-500">{activeSection.categories.length} {activeSection.categories.length === 1 ? 'categoría' : 'categorías'}</p>
                </div>
                <Badge variant="ink" size="sm">{activeSection.slug}</Badge>
              </div>

              <div className="space-y-2">
                {activeSection.categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-ink-900/10">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-ink-900 truncate">{c.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-mono">
                        {c.slug} · {c._count.products} {c._count.products === 1 ? 'producto' : 'productos'}
                      </p>
                      {c.description && (
                        <p className="text-[11px] text-ink-500 mt-1 line-clamp-1">{c.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteCategory(c.id, c.name)}
                      className="p-1.5 text-ink-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {activeSection.categories.length === 0 && (
                  <p className="text-xs text-ink-500 text-center py-4">No hay categorías todavía.</p>
                )}
              </div>

              {newCategory?.sectionId === activeSection.id ? (
                <form onSubmit={createCategory} className="mt-4 pt-4 border-t border-ink-900/10 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider font-black text-ink-500">Nueva categoría</p>
                  <input
                    type="text"
                    placeholder="Nombre (ej. Versión Jugador)"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    autoFocus
                    className="w-full px-3 py-2 bg-cream-50 border border-ink-900/10 rounded-full text-xs focus:outline-none focus:border-ink-900"
                  />
                  <input
                    type="text"
                    placeholder="slug (ej. version-jugador)"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full px-3 py-2 bg-cream-50 border border-ink-900/10 rounded-full text-xs font-mono focus:outline-none focus:border-ink-900"
                  />
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-ink-900/10 rounded-full text-xs focus:outline-none focus:border-ink-900"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" isLoading={saving} className="flex-1">
                      <Save className="w-3.5 h-3.5" />
                      Guardar
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setNewCategory(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setNewCategory({ sectionId: activeSection.id, name: '', slug: '', description: '' })}
                  className="mt-4"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar categoría
                </Button>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-ink-500 text-sm">
              <FolderTree className="w-10 h-10 mx-auto mb-3 text-ink-300" />
              <p className="font-bold text-ink-900">Seleccioná una sección</p>
              <p className="text-xs mt-1">O creá una nueva en el panel de la izquierda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
