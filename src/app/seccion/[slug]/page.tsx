import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { ProductCard, SerializedProduct } from '@/components/store/ProductCard'
import { CatalogFilters } from '@/components/store/CatalogFilters'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getNavSections } from '@/lib/navSections'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const revalidate = 0

const CATEGORY_HERO: Record<string, string> = {
  'titulares': '/categorias/titulares.webp',
  'suplentes': '/categorias/suplentes.webp',
  'arquero': '/categorias/arquero.webp',
  'retro': '/categorias/retro.webp',
  'hincha': '/categorias/hincha.webp',
  'manga-larga': '/categorias/manga-larga.svg',
  'coleccion-oasis-25': '/categorias/coleccion-oasis-25.svg',
  'icon-terrace': '/categorias/icon-terrace.svg',
}

const SECTION_HERO: Record<string, string> = {
  'shorts': '/categorias/shorts-default.svg',
  'camperas': '/categorias/camperas-default.svg',
  'conjuntos': '/categorias/conjuntos-default.svg',
}

interface SectionPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ category?: string; country?: string; league?: string; q?: string }>
}

export async function generateMetadata({ params }: SectionPageProps) {
  const { slug } = await params
  const section = await prisma.section.findUnique({ where: { slug } })
  if (!section) return { title: 'Sección no encontrada | PielFutbolera' }
  return {
    title: `${section.name} | PielFutbolera`,
    description: section.description,
  }
}

export default async function SectionPage({ params, searchParams }: SectionPageProps) {
  const { slug } = await params
  const sp = await searchParams
  const categoryFilter = sp.category
  const countryFilter = sp.country
  const leagueFilter = sp.league
  const searchQuery = sp.q

  const section = await prisma.section.findUnique({
    where: { slug },
    include: {
      categories: { orderBy: { order: 'asc' } },
    },
  })

  if (!section) notFound()

  const selectedCategory = categoryFilter
    ? section.categories.find((c) => c.slug === categoryFilter || c.id === categoryFilter)
    : null

  const countries = await prisma.country.findMany({ orderBy: { name: 'asc' } })
  const leagues = await prisma.league.findMany({ orderBy: { name: 'asc' } })
  const allSections = await getNavSections()
  const allCategories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, slug: true, name: true, sectionId: true },
  })

  const rawProducts = await prisma.product.findMany({
    where: {
      isDeleted: false,
      category: { sectionId: section.id },
      ...(selectedCategory ? { categoryId: selectedCategory.id } : {}),
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
    include: {
      variants: true,
      country: true,
      league: true,
      category: { include: { section: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const products: SerializedProduct[] = rawProducts.map((p) => {
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

  const heroImage = selectedCategory
    ? CATEGORY_HERO[selectedCategory.slug]
    : SECTION_HERO[section.slug] ?? '/hero-jersey.png'

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header sections={allSections} />

      <main className="flex-1">
        <section className="relative h-[280px] sm:h-[340px] lg:h-[400px] overflow-hidden bg-ink-900">
          <Image
            src={heroImage}
            alt={selectedCategory?.name ?? section.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-cream-50/70 hover:text-lime-400 text-xs font-bold mb-3 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al Inicio
              </Link>
              <Badge variant="primary" size="md" className="mb-3">
                {selectedCategory ? section.name : 'Colección'}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-cream-50 font-outfit leading-none">
                {selectedCategory ? selectedCategory.name : section.name}
              </h1>
              {(selectedCategory?.description ?? section.description) && (
                <p className="text-cream-50/80 mt-3 text-sm sm:text-base max-w-2xl">
                  {selectedCategory?.description ?? section.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {section.categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-black text-lime-500">
                  Explorá
                </p>
                <h2 className="text-3xl sm:text-4xl font-black text-ink-900 font-outfit mt-1">
                  Modelos de {section.name.toLowerCase()}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {section.categories.map((cat) => {
                const img = CATEGORY_HERO[cat.slug]
                const isActive = selectedCategory?.id === cat.id
                const href = isActive
                  ? `/seccion/${section.slug}`
                  : `/seccion/${section.slug}?category=${cat.slug}`

                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className={`group relative block aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${isActive
                      ? 'border-lime-400 shadow-[8px_8px_0_0_#C5F82A]'
                      : 'border-ink-900 hover:shadow-[8px_8px_0_0_rgba(10,10,10,1)]'
                      }`}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-ink-900 to-ink-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-cream-50">
                      <h3 className="text-xl sm:text-2xl font-black font-outfit leading-none">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-[11px] text-cream-50/70 mt-1.5 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-lime-400 uppercase tracking-wider">
                        {isActive ? 'Quitar filtro' : 'Ver modelos'}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-lime-400 text-ink-900 flex items-center justify-center text-base font-black">
                        ✓
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-black text-ink-500">
                {selectedCategory ? 'Filtrado por' : 'Todos los modelos'}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-ink-900 font-outfit mt-1">
                {selectedCategory
                  ? selectedCategory.name
                  : `${products.length} ${products.length === 1 ? 'modelo' : 'modelos'} en ${section.name.toLowerCase()}`}
              </h3>
            </div>
          </div>

          <CatalogFilters
            countries={countries}
            leagues={leagues}
            sections={allSections}
            categories={allCategories}
            basePath={`/seccion/${section.slug}`}
            sectionSlug={section.slug}
          />

          {products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-ink-900/8 space-y-3">
              <p className="text-ink-900 font-bold">
                No encontramos modelos que coincidan con los filtros.
              </p>
              <p className="text-xs text-ink-500">Probá quitar el filtro de categoría o limpiar la búsqueda.</p>
              <Link href={`/seccion/${section.slug}`}>
                <Button variant="primary" size="md" className="mt-2">
                  Ver todos los modelos
                </Button>
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
