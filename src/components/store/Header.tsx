'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShoppingBag, Search, Shield, Menu, X, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { CartDrawer } from './CartDrawer'

export interface HeaderSection {
  id: string
  slug: string
  name: string
  categories: { id: string; slug: string; name: string }[]
}

interface HeaderProps {
  sections?: HeaderSection[]
}

function HeaderContent({ sections = [] }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const { getTotalItems } = useCartStore()
  const totalItems = mounted ? getTotalItems() : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/')
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative w-10 h-10 overflow-hidden rounded-2xl shadow-sm border border-ink-900/10 group-hover:rotate-3 transition-transform">
                  <Image src="/logo.jpg" alt="PielFutbolera" fill className="object-cover" sizes="40px" />
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight text-ink-900 font-outfit leading-none block">
                    Piel<span className="text-lime-500">Futbolera</span>
                  </span>
                  <span className="block text-[9px] uppercase font-bold text-ink-500 mt-0.5 tracking-[0.18em]">
                    Premium Football Kits
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className="px-3.5 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-900/[0.04] rounded-full transition"
                >
                  Inicio
                </Link>
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="relative"
                    onMouseEnter={() => setOpenSectionId(section.id)}
                    onMouseLeave={() => setOpenSectionId(null)}
                  >
                    <Link
                      href={`/?section=${section.slug}#catalogo`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-900/[0.04] rounded-full transition"
                    >
                      {section.name}
                      {section.categories.length > 0 && (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </Link>
                    {section.categories.length > 0 && openSectionId === section.id && (
                      <div className="absolute left-0 top-full pt-1 z-50">
                        <div className="min-w-[240px] bg-white border border-ink-900/10 rounded-2xl shadow-[0_18px_42px_-12px_rgba(10,10,10,0.25)] overflow-hidden">
                          {section.categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/?category=${cat.slug}#catalogo`}
                              className="block px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-cream-50 hover:text-ink-900 transition"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-sm mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar camiseta, liga, año..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-ink-900/10 focus:border-ink-900 rounded-full text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-ink-500" />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-ink-700 hover:text-ink-900 rounded-full transition"
                title="Panel de Administración"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-ink-900 hover:bg-ink-800 text-cream-50 rounded-full transition flex items-center gap-2"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-lime-400 text-ink-900 text-[10px] font-black rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-ink-700 hover:text-ink-900 rounded-full"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-ink-900/10 bg-cream-50 px-4 py-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-ink-900/10 rounded-full text-xs text-ink-900 placeholder-ink-500 focus:outline-none focus:border-ink-900"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-ink-500" />
              </div>
            </form>

            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-white hover:text-ink-900 rounded-full"
              >
                Inicio
              </Link>
              {sections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <Link
                    href={`/?section=${section.slug}#catalogo`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-sm font-bold text-ink-900 hover:bg-white rounded-full inline-block"
                  >
                    {section.name}
                  </Link>
                  <div className="ml-4 border-l-2 border-ink-900/10 pl-3 space-y-1">
                    {section.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/?category=${cat.slug}#catalogo`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 hover:bg-white rounded-full"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-white rounded-full flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Panel Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export const Header: React.FC<HeaderProps> = ({ sections }) => {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-40 glass-nav h-20 flex items-center px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10 overflow-hidden rounded-2xl bg-white border border-ink-900/10">
            <Image src="/logo.jpg" alt="PielFutbolera" fill className="object-cover" sizes="40px" />
          </div>
          <span className="text-lg font-black text-ink-900 font-outfit">Piel<span className="text-lime-500">Futbolera</span></span>
        </Link>
      </header>
    }>
      <HeaderContent sections={sections} />
    </Suspense>
  )
}
