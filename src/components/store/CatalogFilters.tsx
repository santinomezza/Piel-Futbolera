'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Globe, Trophy, Filter, X, RotateCcw } from 'lucide-react'

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

interface CatalogFiltersProps {
  countries: CountryFilterData[]
  leagues: LeagueFilterData[]
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({ countries, leagues }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCountry = searchParams.get('country') || ''
  const activeLeague = searchParams.get('league') || ''
  const activeCategory = searchParams.get('category') || ''
  const activeQuery = searchParams.get('q') || ''

  const [searchInputValue, setSearchInputValue] = useState(activeQuery)

  useEffect(() => {
    setSearchInputValue(activeQuery)
  }, [activeQuery])

  // Filter leagues by active country if selected
  const availableLeagues = activeCountry
    ? leagues.filter((l) => l.countryId === activeCountry)
    : leagues

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

  const hasActiveFilters = Boolean(activeCountry || activeLeague || activeCategory || activeQuery)

  return (
    <div className="space-y-4 bg-[#0F1622] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl">
      
      {/* Header & Quick Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white font-outfit text-lg">Explorador de Camisetas</h3>
            <p className="text-xs text-slate-400">Filtrá por País, Liga, Categoría o Búsqueda Libre</p>
          </div>
        </div>

        {/* Free text search bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar equipo, jugador o año (ej: 1986)..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          {searchInputValue && (
            <button
              type="button"
              onClick={() => {
                setSearchInputValue('')
                updateFilters({ q: null })
              }}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        
        {/* Country Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>País</span>
          </label>
          <select
            value={activeCountry}
            onChange={(e) => {
              const countryId = e.target.value
              // Reset league if selected country doesn't match current league
              updateFilters({ country: countryId, league: null })
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition font-medium"
          >
            <option value="">Todos los Países</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* League Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Liga</span>
          </label>
          <select
            value={activeLeague}
            onChange={(e) => updateFilters({ league: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition font-medium"
          >
            <option value="">Todas las Ligas</option>
            {availableLeagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Categoría</span>
          </label>
          <select
            value={activeCategory}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition font-medium"
          >
            <option value="">Todas las Categorías</option>
            <option value="TITULAR">Titulares</option>
            <option value="SUPLENTE">Suplentes</option>
            <option value="RETRO">Ediciones Retro</option>
            <option value="ARQUERO">Arquero</option>
          </select>
        </div>

      </div>

      {/* Active Filter Badges & Reset */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Filtros activos:</span>
            
            {activeCountry && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Globe className="w-3 h-3" />
                {countries.find((c) => c.id === activeCountry)?.name || 'País'}
                <button onClick={() => updateFilters({ country: null })} className="ml-1 text-emerald-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeLeague && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Trophy className="w-3 h-3" />
                {leagues.find((l) => l.id === activeLeague)?.name || 'Liga'}
                <button onClick={() => updateFilters({ league: null })} className="ml-1 text-amber-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                {activeCategory}
                <button onClick={() => updateFilters({ category: null })} className="ml-1 text-emerald-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                "{activeQuery}"
                <button onClick={() => updateFilters({ q: null })} className="ml-1 text-purple-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar todos los filtros</span>
          </button>
        </div>
      )}

    </div>
  )
}
