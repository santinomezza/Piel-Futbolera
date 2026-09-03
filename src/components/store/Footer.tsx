import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Truck, CreditCard, ShieldCheck, RotateCcw } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ink-900 text-cream-50 mt-24">

      {/* Guarantees bar (dark accent) */}
      <div className="bg-lime-400 text-ink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Truck className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wider">Envíos 24/48h</p>
              <p className="text-[11px] opacity-80">Todo el país</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <CreditCard className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wider">Mercado Pago</p>
              <p className="text-[11px] opacity-80">Cuotas sin interés</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wider">Compra Segura</p>
              <p className="text-[11px] opacity-80">Datos protegidos</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <RotateCcw className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wider">Cambios</p>
              <p className="text-[11px] opacity-80">Dentro de 30 días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4 space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 overflow-hidden rounded-2xl border-2 border-lime-400">
              <Image src="/logo.jpg" alt="PielFutbolera" fill className="object-cover" sizes="48px" />
            </div>
            <div>
              <p className="font-black text-2xl font-outfit">Piel<span className="text-lime-400">Futbolera</span></p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-cream-50/60">Premium Football Kits</p>
            </div>
          </div>
          <p className="text-sm text-cream-50/70 leading-relaxed max-w-sm">
            Especialistas en camisetas deportivas y retro con confección premium en Argentina.
            Diseños genéricos propios con identidad futbolera.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-lime-400 text-ink-900 rounded-full text-[10px] font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-ink-900 rounded-full animate-pulse" />
            Envíos activos
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[11px] uppercase font-black tracking-[0.18em] text-cream-50/50 mb-4">Colecciones</h4>
          <ul className="space-y-2.5 text-sm text-cream-50/80">
            <li><Link href="/?category=TITULAR" className="hover:text-lime-400 transition">Titulares</Link></li>
            <li><Link href="/?category=SUPLENTE" className="hover:text-lime-400 transition">Suplentes</Link></li>
            <li><Link href="/?category=RETRO" className="hover:text-lime-400 transition">Retro</Link></li>
            <li><Link href="/?category=ARQUERO" className="hover:text-lime-400 transition">Arquero</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[11px] uppercase font-black tracking-[0.18em] text-cream-50/50 mb-4">Envíos</h4>
          <ul className="space-y-2.5 text-sm text-cream-50/80">
            <li className="flex items-center justify-between gap-2">
              <span>Andreani</span>
              <span className="text-[10px] bg-lime-400 text-ink-900 px-2 py-0.5 rounded-full font-bold">API Real</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span>Correo Argentino</span>
              <span className="text-[10px] bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full font-bold">API Real</span>
            </li>
          </ul>
          <p className="text-[11px] text-cream-50/50 mt-3 leading-relaxed">
            Cotización automática en el checkout según tu código postal.
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[11px] uppercase font-black tracking-[0.18em] text-cream-50/50 mb-4">Contacto</h4>
          <ul className="space-y-2.5 text-sm text-cream-50/80">
            <li>hola@pielfutbolera.com.ar</li>
            <li>+54 11 5555 0000</li>
            <li>Lun a Vie · 10 a 18 hs</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream-50/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-50/50">
          <p>© {new Date().getFullYear()} PielFutbolera. Hecho con <span className="text-lime-400">⚽</span> en Argentina.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-lime-400 transition">Admin</Link>
            <span>·</span>
            <span>Powered by PielFutbolera</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
