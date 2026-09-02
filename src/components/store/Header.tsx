'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShoppingBag, Search, Shield, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { CartDrawer } from './CartDrawer'

function HeaderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const categories = [
    { name: 'Todas', href: '/' },
    { name: 'Titulares', href: '/?category=TITULAR' },
    { name: 'Suplentes', href: '/?category=SUPLENTE' },
    { name: 'Retro', href: '/?category=RETRO' },
    { name: 'Arquero', href: '/?category=ARQUERO' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-11 h-11 overflow-hidden rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition bg-slate-900 border border-slate-800">
                  <Image src="/logo.jpg" alt="PielFutbolera" fill className="object-cover" sizes="44px" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-white font-outfit leading-none block">
                    PielFutbolera
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-emerald-400 mt-1 tracking-widest">
                    Camisetas
                  </span>
                </div>
              </Link>

              {/* Desktop Category Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-sm mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar camiseta (ej. Albiceleste, 1986)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </form>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {/* Admin Panel button */}
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl transition"
                title="Panel de Administración"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Panel Dueño</span>
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl transition flex items-center gap-2"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold hidden sm:inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="w-5 h-5 bg-emerald-500 text-slate-950 text-[11px] font-black rounded-full flex items-center justify-center animate-pulse-glow">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#0E131F] px-4 py-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar camiseta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </form>

            <div className="flex flex-col space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-slate-800 rounded-lg flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Panel Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Slide-over Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export const Header: React.FC = () => {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-40 glass-nav border-b border-slate-800 h-20 flex items-center justify-between px-8 text-white font-bold font-outfit">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
            <Image src="/logo.jpg" alt="PielFutbolera" fill className="object-cover" sizes="40px" />
          </div>
          <span className="text-2xl font-black">PielFutbolera</span>
        </Link>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  )
}
