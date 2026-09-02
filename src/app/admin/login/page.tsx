'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/admin')
      } else {
        setErrorMsg(data.error || 'Credenciales incorrectas')
      }
    } catch {
      setErrorMsg('Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0F1622] rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white font-outfit">PielFutbolera · Admin</h1>
          <p className="text-xs text-slate-400">Ingresá con tu cuenta de administración del negocio.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pielfutbolera.com.ar"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <Button variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
            Ingresar al Panel
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">Credenciales por defecto dev: admin@pielfutbolera.com.ar / admin123</p>
        </div>

      </div>
    </div>
  )
}
