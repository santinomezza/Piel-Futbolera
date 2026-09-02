'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Save, Eye, EyeOff, Check, AlertTriangle, Trash2 } from 'lucide-react'

interface ConfigFormProps {
  mpPublicKey: string
  mpAccessTokenSet: boolean
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ mpPublicKey, mpAccessTokenSet }) => {
  const [publicKey, setPublicKey] = useState(mpPublicKey)
  const [accessToken, setAccessToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const save = async (body: Record<string, string | null>) => {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.ok
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setSaving(true)
    try {
      const ok1 = await save({ mpPublicKey: publicKey })
      const ok2 = accessToken.length > 0 ? await save({ mpAccessToken: accessToken }) : true
      if (ok1 && ok2) {
        setFeedback({ type: 'ok', msg: 'Configuración guardada correctamente.' })
        setAccessToken('')
        setTimeout(() => window.location.reload(), 800)
      } else {
        setFeedback({ type: 'err', msg: 'Error al guardar la configuración.' })
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Error de conexión.' })
    } finally {
      setSaving(false)
    }
  }

  const clearToken = async () => {
    if (!confirm('¿Eliminar el Access Token guardado?')) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config?key=mp_access_token_encrypted', {
        method: 'DELETE',
      })
      if (res.ok) {
        setFeedback({ type: 'ok', msg: 'Access Token eliminado.' })
        setTimeout(() => window.location.reload(), 800)
      }
    } finally {
      setSaving(false)
    }
  }

  const clearPublicKey = async () => {
    if (!confirm('¿Eliminar la Public Key guardada?')) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config?key=mp_public_key', { method: 'DELETE' })
      if (res.ok) {
        setFeedback({ type: 'ok', msg: 'Public Key eliminada.' })
        setTimeout(() => window.location.reload(), 800)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'ok'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {feedback.type === 'ok' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      <div className="bg-[#0F2418] rounded-3xl border border-emerald-900 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-outfit">Mercado Pago</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Credenciales de la cuenta de MP que procesará los cobros.
            </p>
          </div>
          {mpAccessTokenSet && publicKey ? (
            <Badge variant="emerald" size="md">Configurado</Badge>
          ) : (
            <Badge variant="amber" size="md">Faltan credenciales</Badge>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Public Key
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="APP_USR-xxxxxxxx-xxxxxx-xxxxxx-xxxxxxxx"
              className="flex-1 px-3.5 py-2.5 bg-emerald-950 border border-emerald-900 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
            {mpAccessTokenSet && (
              <Button type="button" variant="outline" size="md" onClick={clearPublicKey}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Identifica tu cuenta públicamente. Se usa en el frontend para inicializar el SDK de MP.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Access Token (privado)
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder={mpAccessTokenSet ? '••••••••••••••••' : 'APP_USR-xxxxxxxx'}
                className="w-full px-3.5 py-2.5 bg-emerald-950 border border-emerald-900 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300"
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {mpAccessTokenSet && (
              <Button type="button" variant="outline" size="md" onClick={clearToken}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Se guarda encriptado (AES-256-GCM) en la base de datos. Dejá vacío para mantener el actual.
          </p>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Importante
          </p>
          <p className="text-amber-200/80">
            Las credenciales de producción y test son distintas. Usá las de test (sandbox) para validar primero.
            Configurá el webhook en tu panel de MP apuntando a <code className="font-mono">/api/webhooks/mercadopago</code>.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={saving}>
            <Save className="w-3.5 h-3.5" />
            <span>Guardar configuración</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
