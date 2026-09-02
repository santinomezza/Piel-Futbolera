import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ConfigForm } from './ConfigForm'

export const revalidate = 0

export default async function AdminConfigPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session || session.value !== 'authenticated_token_doce_admin_2026') {
    redirect('/admin/login')
  }

  const pub = await prisma.storeConfig.findUnique({ where: { key: 'mp_public_key' } })
  const priv = await prisma.storeConfig.findUnique({
    where: { key: 'mp_access_token_encrypted' },
  })

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Configuración de la Tienda</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestioná las credenciales de Mercado Pago y otros ajustes del sistema.
          </p>
        </div>

        <ConfigForm
          mpPublicKey={pub?.value ?? ''}
          mpAccessTokenSet={Boolean(priv?.value)}
        />
      </main>
    </div>
  )
}
