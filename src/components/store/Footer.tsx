import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Truck, CreditCard, RefreshCw } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0D14] border-t border-slate-800 text-slate-400 mt-20">
      
      {/* Guarantees bar */}
      <div className="border-b border-slate-800/80 py-8 bg-[#0E131F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Envíos a todo el país</h4>
              <p className="text-xs text-slate-400">Por Andreani y Correo Argentino</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Pago 100% Seguro</h4>
              <p className="text-xs text-slate-400">Checkout Oficial Mercado Pago</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Hasta 6 cuotas</h4>
              <p className="text-xs text-slate-400">Todas las tarjetas de crédito</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Cambios de Talle</h4>
              <p className="text-xs text-slate-400">Garantía de satisfacción</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
              <Image src="/logo.jpg" alt="PielFutbolera" fill className="object-cover" sizes="40px" />
            </div>
            <span className="font-extrabold text-xl text-white font-outfit">PielFutbolera</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Especialistas en camisetas deportivas y retro con confección premium en Argentina. Diseños genéricos propios con identidad futbolera.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-100 mb-4 uppercase tracking-wider text-xs">Categorías</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/?category=TITULAR" className="hover:text-emerald-400 transition">Camisetas Titulares</Link></li>
            <li><Link href="/?category=SUPLENTE" className="hover:text-emerald-400 transition">Camisetas Suplentes</Link></li>
            <li><Link href="/?category=RETRO" className="hover:text-emerald-400 transition">Colección Retro</Link></li>
            <li><Link href="/?category=ARQUERO" className="hover:text-emerald-400 transition">Edición Arquero</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-100 mb-4 uppercase tracking-wider text-xs">Empresas de Correo</h4>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-200">Andreani</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">API Real Time</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-200">Correo Argentino</span>
              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded font-bold">API Real Time</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-100 mb-4 uppercase tracking-wider text-xs">Administración</h4>
          <p className="text-xs text-slate-400 mb-3">Acceso exclusivo para el dueño del negocio.</p>
          <Link href="/admin/login" className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-emerald-400 transition">
            Iniciar Sesión Admin
          </Link>
        </div>

      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} PielFutbolera. Todos los derechos reservados. Argentina.
      </div>
    </footer>
  )
}
