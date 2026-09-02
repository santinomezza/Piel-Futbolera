import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { StockManagerClient } from './StockManagerClient'

export const revalidate = 0

export default async function AdminStockPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session || session.value !== 'authenticated_token_doce_admin_2026') {
    redirect('/admin/login')
  }

  const variants = await prisma.productVariant.findMany({
    include: {
      product: true,
    },
    orderBy: [
      { product: { name: 'asc' } },
      { size: 'asc' },
    ],
  })

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Control de Stock por Variante</h1>
          <p className="text-xs text-slate-400 mt-1">
            Actualizá en tiempo real las existencias por talle para evitar sobreventas.
          </p>
        </div>

        <StockManagerClient variants={variants} />
      </main>
    </div>
  )
}
