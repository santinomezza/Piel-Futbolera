import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { ProductCard, SerializedProduct } from '@/components/store/ProductCard'
import { CatalogFilters } from '@/components/store/CatalogFilters'
import { Sparkles, ShieldCheck } from 'lucide-react'

interface HomePageProps {
  searchParams: Promise<{
    category?: string
    country?: string
    league?: string
    q?: string
  }>
}

export const revalidate = 0

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams
  const categoryFilter = resolvedParams.category
  const countryFilter = resolvedParams.country
  const leagueFilter = resolvedParams.league
  const searchQuery = resolvedParams.q

  // Fetch countries & leagues for filter component
  const countries = await prisma.country.findMany({
    orderBy: { name: 'asc' },
  })

  const leagues = await prisma.league.findMany({
    orderBy: { name: 'asc' },
  })

  // Build Prisma where query with soft delete check (isDeleted: false)
  const rawProducts = await prisma.product.findMany({
    where: {
      isDeleted: false,
      ...(categoryFilter ? { category: categoryFilter } : {}),
      ...(countryFilter ? { countryId: countryFilter } : {}),
      ...(leagueFilter ? { leagueId: leagueFilter } : {}),
      ...(searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery } },
              { description: { contains: searchQuery } },
              { country: { name: { contains: searchQuery } } },
              { league: { name: { contains: searchQuery } } },
            ],
          }
        : {}),
    },
    include: {
      variants: true,
      country: true,
      league: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Serialize product images JSON string to array
  const products: SerializedProduct[] = rawProducts.map((p: typeof rawProducts[number]) => {
    let parsedImages: string[] = []
    try {
      parsedImages = JSON.parse(p.images)
    } catch {
      parsedImages = [p.images]
    }
    return {
      ...p,
      images: parsedImages,
    }
  })

  const selectedCountryObj = countries.find((c) => c.id === countryFilter)
  const selectedLeagueObj = leagues.find((l) => l.id === leagueFilter)

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1A12]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Hero Section */}
        {!categoryFilter && !countryFilter && !leagueFilter && !searchQuery && (
          <section className="relative rounded-3xl overflow-hidden border border-emerald-900 shadow-2xl">
            <div className="absolute inset-0 z-0">
              <Image
                src="/hero-bg.avif"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover scale-105"
                style={{ filter: 'blur(6px)' }}
              />
              <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/55 to-transparent" />
            </div>
            <div className="relative z-10 p-8 sm:p-12">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Ediciones Especiales & Ligas Mundiales 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-outfit leading-tight">
                Camisetas de Fútbol con <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">Identidad Única</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Colecciones organizadas por liga y país. Diseños exclusivos, materiales de alta tecnología deportiva y confección de calidad superior.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalogo"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition"
                >
                  Explorar Catálogo
                </a>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-emerald-950/60 px-4 py-3 rounded-xl border border-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Envíos Nacionales Andreani & Correo Arg</span>
                </div>
              </div>
            </div>
            </div>

            {/* Background glow element */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          </section>
        )}

        {/* Combinable Catalog Filters */}
        <section id="catalogo">
          <CatalogFilters countries={countries} leagues={leagues} />
        </section>

        {/* Catalog Section & Product Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white font-outfit">
                {selectedLeagueObj
                  ? `Camisetas de ${selectedLeagueObj.name}`
                  : selectedCountryObj
                  ? `Camisetas de ${selectedCountryObj.name}`
                  : searchQuery
                  ? `Resultados para "${searchQuery}"`
                  : 'Catálogo de Productos'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {products.length} {products.length === 1 ? 'modelo disponible' : 'modelos disponibles'}
              </p>
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="p-12 text-center bg-[#0F2418] rounded-3xl border border-emerald-900 space-y-3">
              <p className="text-slate-300 font-semibold">No encontramos camisetas que coincidan con los filtros aplicados.</p>
              <p className="text-xs text-slate-500">Probá modificando o limpiando los filtros seleccionados.</p>
              <Link href="/" className="inline-block mt-2 px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-xs font-bold text-emerald-400 rounded-xl transition">
                Ver Todas las Camisetas
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  )
}
