import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { ProductCard, SerializedProduct } from '@/components/store/ProductCard'
import { CatalogFilters } from '@/components/store/CatalogFilters'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Sparkles, ShieldCheck, Truck, Ruler, Award, Zap, ArrowRight, Quote, Star, Globe2 } from 'lucide-react'
import { getNavSections } from '@/lib/navSections'

interface HomePageProps {
  searchParams: Promise<{
    category?: string
    section?: string
    country?: string
    league?: string
    q?: string
  }>
}

export const revalidate = 0

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams
  const sectionFilter = resolvedParams.section
  const categoryFilter = resolvedParams.category
  const countryFilter = resolvedParams.country
  const leagueFilter = resolvedParams.league
  const searchQuery = resolvedParams.q

  const countries = await prisma.country.findMany({ orderBy: { name: 'asc' } })
  const leagues = await prisma.league.findMany({ orderBy: { name: 'asc' } })
  const sections = await prisma.section.findMany({
    orderBy: { order: 'asc' },
    include: { categories: { orderBy: { order: 'asc' } } },
  })

  const selectedSection = sectionFilter
    ? sections.find((s) => s.id === sectionFilter || s.slug === sectionFilter)
    : null

  const categoryFilterResolved = categoryFilter
    ? await prisma.category.findFirst({
        where: {
          OR: [{ id: categoryFilter }, { slug: categoryFilter }],
          ...(selectedSection ? { sectionId: selectedSection.id } : {}),
        },
        include: { section: true },
      })
    : null

  const rawProducts = await prisma.product.findMany({
    where: {
      isDeleted: false,
      ...(selectedSection ? { category: { sectionId: selectedSection.id } } : {}),
      ...(categoryFilterResolved ? { categoryId: categoryFilterResolved.id } : {}),
      ...(countryFilter ? { countryId: countryFilter } : {}),
      ...(leagueFilter ? { leagueId: leagueFilter } : {}),
      ...(searchQuery
        ? {
          OR: [
            { name: { contains: searchQuery } },
            { description: { contains: searchQuery } },
            { country: { name: { contains: searchQuery } } },
            { league: { name: { contains: searchQuery } } },
            { category: { name: { contains: searchQuery } } },
          ],
        }
        : {}),
    },
    include: { variants: true, country: true, league: true, category: { include: { section: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const products: SerializedProduct[] = rawProducts.map((p: typeof rawProducts[number]) => {
    let parsed: string[] = []
    try { parsed = JSON.parse(p.images) } catch { parsed = [p.images] }
    return {
      ...p,
      images: parsed,
      categoryId: p.categoryId,
      categoryName: p.category?.name ?? null,
      sectionName: p.category?.section?.name ?? null,
    }
  })

  const featured = products.slice(0, 6)
  const heroProduct = products[0]
  const heroImage = '/hero-jersey.png'

  const selectedCountryObj = countries.find((c) => c.id === countryFilter)
  const selectedLeagueObj = leagues.find((l) => l.id === leagueFilter)
  const selectedCategoryObj = categoryFilterResolved
  const isFiltering = Boolean(sectionFilter || categoryFilter || countryFilter || leagueFilter || searchQuery)

  const navSections = await getNavSections()

  const CATEGORY_HERO: Record<string, string> = {
    'version-jugador': '/categorias/titulares.webp',
    'suplentes': '/categorias/suplentes.webp',
    'retro': '/categorias/retro.webp',
    'arquero': '/categorias/arquero.webp',
    'hincha': '/categorias/hincha.webp',
  }
  const categoryHeroImage = selectedCategoryObj?.slug ? CATEGORY_HERO[selectedCategoryObj.slug] : null

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header sections={navSections} />

      <main className="flex-1">

        {!isFiltering && (
          <>
            {/* === HERO EDITORIAL === */}
            <section className="relative overflow-hidden bg-cream-100">
              <div className="absolute inset-0 bg-dots opacity-50" />
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                  {/* Text column */}
                  <div className="lg:col-span-5 space-y-6 relative z-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-400 text-ink-900 text-[10px] font-black uppercase tracking-[0.18em]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ediciones 2026</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-ink-900 font-outfit leading-[0.95] tracking-tight">
                      Camisetas con
                      <span className="block text-lime-500">identidad</span>
                      <span className="block">futbolera.</span>
                    </h1>

                    <p className="text-base text-ink-500 leading-relaxed max-w-md">
                      Colecciones premium organizadas por liga y país. Diseños genéricos propios con
                      confección de calidad superior y envíos a todo el país.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <a href="#catalogo">
                        <Button variant="primary" size="lg">
                          Explorar Catálogo
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </a>
                      <div className="flex items-center gap-2 text-xs text-ink-700 bg-white px-4 py-3 rounded-full border border-ink-900/8">
                        <ShieldCheck className="w-4 h-4 text-ink-900 shrink-0" />
                        <span className="font-semibold">Pago seguro · Mercado Pago</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4">
                      {[
                        { v: '+200', l: 'Ventas' },
                        { v: '24h', l: 'Despacho' },
                        { v: '4.9★', l: 'Reviews' },
                      ].map((s) => (
                        <div key={s.l} className="bg-white p-3 rounded-2xl border border-ink-900/8">
                          <p className="text-xl sm:text-2xl font-black text-ink-900 font-outfit leading-none">{s.v}</p>
                          <p className="text-[10px] uppercase tracking-wider text-ink-500 mt-1 font-bold">{s.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hero image collage */}
                  <div className="lg:col-span-7 relative h-[480px] sm:h-[560px] lg:h-[640px]">
                    {/* Main image (background, slightly offset) */}
                    <div className="absolute top-0 right-0 w-[88%] h-[88%] rounded-3xl overflow-hidden border-2 border-ink-900 shadow-[12px_12px_0_0_rgba(10,10,10,1)] z-10">
                      <Image src={heroImage} alt="Hero" fill className="object-cover" priority sizes="60vw" />
                    </div>

                    {/* Floating card top-left */}
                    <div className="absolute top-4 left-0 z-20 bg-lime-400 text-ink-900 p-4 rounded-2xl border-2 border-ink-900 shadow-[6px_6px_0_0_rgba(10,10,10,1)] max-w-[220px] hidden sm:block">
                      <Badge variant="ink" size="sm" className="mb-2">---UNA PASION---</Badge>
                      <p className="font-black text-sm leading-tight">-QUE SE VISTE-</p>
                    </div>


                  </div>

                </div>
              </div>
            </section>

            {/* === MARQUEE === */}
            <section className="bg-ink-900 py-5 overflow-hidden border-y-2 border-ink-900">
              <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
                {[...countries, ...countries, ...countries, ...countries].map((c, i) => (
                  <span key={`${c.id}-${i}`} className="flex items-center gap-3 text-cream-50/40 font-black text-2xl uppercase tracking-tight">
                    <Globe2 className="w-5 h-5 text-lime-400" />
                    {c.name}
                  </span>
                ))}
              </div>
            </section>

            {/* === FEATURES === */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
                <div className="lg:col-span-7">
                  <SectionHeading
                    eyebrow="Por qué elegirnos"
                    title="Calidad premium en cada detalle"
                    description="No somos una tienda más. Cada camiseta pasa por un proceso de curaduría y confección pensado para durar."
                    accentWord="premium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
                {[
                  { icon: Ruler, title: 'Talles Reales', desc: 'S, M, L, XL, XXL. El talle que pedís es el que llega.' },
                  { icon: Award, title: 'Confección Premium', desc: 'Tela deportiva de alta tecnología, costuras reforzadas.' },
                  { icon: Truck, title: 'Envíos 24/48h', desc: 'Despachamos a todo el país con Andreani y Correo Argentino.' },
                  { icon: Zap, title: 'Stock en Vivo', desc: 'Lo que ves es lo que hay. Sin sobreventa ni demoras.' },
                ].map((f) => (
                  <div key={f.title} className="group bg-white rounded-2xl p-6 border border-ink-900/8 hover:border-ink-900 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_12px_24px_-12px_rgba(10,10,10,0.15)]">
                    <div className="w-12 h-12 bg-lime-400 text-ink-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-ink-900 font-outfit text-lg">{f.title}</h3>
                    <p className="text-sm text-ink-500 leading-relaxed mt-1.5">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* === COLECCIONES === */}
            <section className="bg-cream-100 py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading
                  eyebrow="Colecciones"
                  title="Explorá por sección"
                  description="Camisetas, shorts, camperas y conjuntos: cada categoría con su propia curaduría editorial."
                  align="center"
                  accentWord="sección"
                />

                <div className="flex gap-3 mt-12 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
                  {sections.map((s) => (
                    <Link
                      key={s.id}
                      href={`/?section=${s.slug}#catalogo`}
                      className="group shrink-0 snap-start flex flex-col items-center gap-2 min-w-[140px]"
                    >
                      <div className="w-28 h-28 rounded-full bg-white border-2 border-ink-900 flex items-center justify-center group-hover:bg-lime-400 transition-colors shadow-[4px_4px_0_0_rgba(10,10,10,1)]">
                        <span className="text-3xl">⚽</span>
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-ink-900 text-center">
                        {s.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* === PRODUCTOS DESTACADOS === */}
            {featured.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <SectionHeading
                    eyebrow="Destacados"
                    title="Lo más buscado"
                    accentWord="buscado"
                  />
                  <Link href="#catalogo">
                    <Button variant="outline" size="md">
                      Ver todo
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {featured.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* === CATÁLOGO + FILTROS === */}
        {categoryHeroImage && selectedCategoryObj && (
          <section className="relative h-[280px] sm:h-[360px] lg:h-[420px] overflow-hidden bg-ink-900">
            <Image
              src={categoryHeroImage}
              alt={selectedCategoryObj.name}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
                <Badge variant="primary" size="md" className="mb-3">
                  {selectedCategoryObj.section?.name || 'Camisetas'}
                </Badge>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-cream-50 font-outfit leading-none">
                  {selectedCategoryObj.name}
                </h2>
                <p className="text-cream-50/80 mt-3 text-sm sm:text-base max-w-2xl">
                  {selectedCategoryObj.description || `Explorá nuestra colección de ${selectedCategoryObj.name.toLowerCase()}.`}
                </p>
              </div>
            </div>
          </section>
        )}

        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 scroll-mt-24">
          <SectionHeading
            eyebrow={isFiltering ? 'Búsqueda' : 'Catálogo'}
            title={
              selectedSection
                ? `Sección: ${selectedSection.name}`
                : selectedCategoryObj
                  ? `Categoría: ${selectedCategoryObj.name}`
                  : selectedLeagueObj
                    ? `Liga: ${selectedLeagueObj.name}`
                    : selectedCountryObj
                      ? `País: ${selectedCountryObj.name}`
                      : searchQuery
                        ? `Resultados para "${searchQuery}"`
                        : 'Explorá el catálogo'
            }
            description={isFiltering ? `${products.length} ${products.length === 1 ? 'modelo encontrado' : 'modelos encontrados'}` : 'Filtrá por sección, categoría, país, liga o búsqueda libre.'}
            accentWord="catálogo"
          />

          <CatalogFilters
            countries={countries}
            leagues={leagues}
            sections={sections}
            categories={sections.flatMap((s) => s.categories)}
          />

          {products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-ink-900/8 space-y-3">
              <p className="text-ink-900 font-bold">No encontramos camisetas que coincidan con los filtros.</p>
              <p className="text-xs text-ink-500">Probá modificar o limpiar los filtros seleccionados.</p>
              <Link href="/">
                <Button variant="primary" size="md" className="mt-2">Ver Todas las Camisetas</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
