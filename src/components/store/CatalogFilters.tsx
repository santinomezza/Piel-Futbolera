'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Globe, Trophy, Filter, X, RotateCcw, Layers, FolderTree } from 'lucide-react'

export interface CountryFilterData {
  id: string
  name: string
  code?: string | null
}

export interface LeagueFilterData {
  id: string
  name: string
  countryId: string
  color?: string | null
}

export interface SectionFilterData {
  id: string
  slug: string
  name: string
}

export interface CategoryFilterData {
  id: string
  slug: string
  name: string
  sectionId: string
}

interface CatalogFiltersProps {
  countries: CountryFilterData[]
  leagues: LeagueFilterData[]
  sections: SectionFilterData[]
  categories: CategoryFilterData[]
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({ countries, leagues, sections, categories }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCountry = searchParams.get('country') || ''
  const activeLeague = searchParams.get('league') || ''
  const activeSection = searchParams.get('section') || ''
  const activeCategory = searchParams.get('category') || ''
  const activeQuery = searchParams.get('q') || ''

  const [searchInputValue, setSearchInputValue] = useState(activeQuery)

  useEffect(() => {
    setSearchInputValue(activeQuery)
  }, [activeQuery])

  const availableLeagues = activeCountry
    ? leagues.filter((l) => l.countryId === activeCountry)
    : leagues

  const availableCategories = activeSection
    ? categories.filter((c) => c.sectionId === activeSection)
    : categories

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== 'ALL' && val.trim() !== '') {
        params.set(key, val)
      } else {
        params.delete(key)
      }
    })
    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}#catalogo` : '/#catalogo', { scroll: false })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: searchInputValue })
  }

  const clearAllFilters = () => {
    setSearchInputValue('')
    router.push('/', { scroll: false })
  }

  const hasActiveFilters = Boolean(activeCountry || activeLeague || activeSection || activeCategory || activeQuery)

  const activeSectionName = activeSection ? sections.find((s) => s.id === activeSection)?.name : ''
  const activeCategoryName = activeCategory ? categories.find((c) => c.id === activeCategory)?.name : ''

  return (
    <div className="space-y-5 bg-white border border-ink-900/8 rounded-3xl p-5 sm:p-7 shadow-[0_4px_18px_rgba(10,10,10,0.04)]">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ink-900 text-lime-400 rounded-full flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-ink-900 font-outfit text-lg">Explorá el catálogo</h3>
            <p className="text-xs text-ink-500">Filtrá por sección, categoría, país, liga o búsqueda libre.</p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar equipo, jugador o año..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-cream-50 border border-ink-900/10 focus:border-ink-900 rounded-full text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-ink-500" />
          {searchInputValue && (
            <button
              type="button"
              onClick={() => {
                setSearchInputValue('')
                updateFilters({ q: null })
              }}
              className="absolute right-3 top-3.5 text-ink-500 hover:text-ink-900"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-ink-500 flex items-center gap-1.5 uppercase tracking-[0.15em]">
            <Layers className="w-3.5 h-3.5" />
            <span>Sección</span>
          </label>
          <select
            value={activeSection}
            onChange={(e) => updateFilters({ section: e.target.value, category: null })}
            className="w-full bg-cream-50 border border-ink-900/10 rounded-full px-4 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900 transition font-semibold"
          >
            <option value="">Todas las Secciones</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-ink-500 flex items-center gap-1.5 uppercase tracking-[0.15em]">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Categoría</span>
          </label>
          <select
            value={activeCategory}
            onChange={(e) => updateFilters({ category: e.target.value })}
            disabled={!availableCategories.length}
            className="w-full bg-cream-50 border border-ink-900/10 rounded-full px-4 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900 transition font-semibold disabled:opacity-50"
          >
            <option value="">Todas</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-ink-500 flex items-center gap-1.5 uppercase tracking-[0.15em]">
            <Globe className="w-3.5 h-3.5" />
            <span>País</span>
          </label>
          <select
            value={activeCountry}
            onChange={(e) => updateFilters({ country: e.target.value, league: null })}
            className="w-full bg-cream-50 border border-ink-900/10 rounded-full px-4 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900 transition font-semibold"
          >
            <option value="">Todos los Países</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-ink-500 flex items-center gap-1.5 uppercase tracking-[0.15em]">
            <Trophy className="w-3.5 h-3.5" />
            <span>Liga</span>
          </label>
          <select
            value={activeLeague}
            onChange={(e) => updateFilters({ league: e.target.value })}
            className="w-full bg-cream-50 border border-ink-900/10 rounded-full px-4 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900 transition font-semibold"
          >
            <option value="">Todas las Ligas</option>
            {availableLeagues.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink-900/8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-ink-500 uppercase tracking-wider">Filtros:</span>

            {activeSectionName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-900 text-lime-400 text-xs font-bold">
                {activeSectionName}
                <button onClick={() => updateFilters({ section: null, category: null })} className="hover:text-cream-50">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeCategoryName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-900 text-cream-50 text-xs font-bold">
                {activeCategoryName}
                <button onClick={() => updateFilters({ category: null })} className="hover:text-lime-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeCountry && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-900 text-cream-50 text-xs font-bold">
                {countries.find((c) => c.id === activeCountry)?.name}
                <button onClick={() => updateFilters({ country: null })} className="hover:text-lime-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeLeague && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                {leagues.find((l) => l.id === activeLeague)?.name}
                <button onClick={() => updateFilters({ league: null })} className="hover:text-amber-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-lime-700 text-xs font-bold">
                "{activeQuery}"
                <button onClick={() => updateFilters({ q: null })} className="hover:text-lime-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-ink-500 hover:text-ink-900 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      )}

    </div>
  )
}
