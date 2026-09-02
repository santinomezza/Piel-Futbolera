'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Download, Store, Settings, Menu, X } from 'lucide-react'

export const AdminHeader: React.FC = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Productos', href: '/admin/products', icon: Package },
    { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
    { name: 'Stock', href: '/admin/stock', icon: Package },
    { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
  ]

  return (
    <header className="bg-[#08130D] border-b border-emerald-900/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-9 h-9 overflow-hidden rounded-lg shadow-md shadow-emerald-500/20 bg-emerald-950 border border-emerald-900">
              <Image src="/logo.jpg" alt="PielFutbolera" fill className="object-cover" sizes="36px" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-white font-outfit">PielFutbolera</span>
              <span className="hidden sm:inline text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 ml-6">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-emerald-950'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Action buttons (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="/api/admin/export"
              target="_blank"
              download
              className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Exportar CSV</span>
            </a>
            <Link
              href="/"
              className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline">Ver Tienda</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-emerald-950 rounded-lg transition"
            aria-label="Abrir menú de administración"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-900 bg-[#06120C]">
          <nav className="px-4 py-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-emerald-950 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
            <div className="pt-2 mt-2 border-t border-emerald-900 flex gap-2">
              <a
                href="/api/admin/export"
                target="_blank"
                download
                className="flex-1 px-3 py-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-emerald-400 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </a>
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 px-3 py-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>Ver Tienda</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
