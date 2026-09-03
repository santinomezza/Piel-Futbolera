import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CatalogManager } from './CatalogManager'

export const revalidate = 0

export default async function AdminCatalogPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session || session.value !== 'authenticated_token_pielfutbolera_admin_2026') {
    redirect('/admin/login')
  }

  const sections = await prisma.section.findMany({
    orderBy: { order: 'asc' },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { products: true } } },
      },
    },
  })

  return (
    <div className="min-h-screen bg-cream-50 text-ink-900 flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-900 font-outfit">Estructura del Catálogo</h1>
          <p className="text-xs text-ink-500 mt-1">
            Gestioná las secciones (camisetas, shorts, camperas, conjuntos) y las sub-categorías de cada una.
          </p>
        </div>

        <CatalogManager initialSections={sections} />
      </main>
    </div>
  )
}
