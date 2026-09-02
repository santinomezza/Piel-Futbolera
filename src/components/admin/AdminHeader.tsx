'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Download, Store, Settings } from 'lucide-react'

export const AdminHeader: React.FC = () => {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Productos', href: '/admin/products', icon: Package },
    { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
    { name: 'Stock', href: '/admin/stock', icon: Package },
    { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
  ]

  return (
    <header className="bg-[#0A0E17] border-b border-slate-800/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 overflow-hidden rounded-lg shadow-md shadow-emerald-500/20 bg-slate-900 border border-slate-800">
                <Image src="/logo.jpg" alt="PielFutbolera" fill className="object-cover" sizes="36px" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white font-outfit">PielFutbolera</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Admin
                </span>
              </div>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export"
              target="_blank"
              download
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </a>

            <Link
              href="/"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>Ver Tienda</span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  )
}
