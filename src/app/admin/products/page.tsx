import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductsManagerClient } from './ProductsManagerClient'

export const revalidate = 0

export default async function AdminProductsPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session || session.value !== 'authenticated_token_pielfutbolera_admin_2026') {
    redirect('/admin/login')
  }

  // Fetch products (including soft-deleted ones for admin view), countries, and leagues
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      country: true,
      league: true,
      variants: true,
    },
  })

  const countries = await prisma.country.findMany({
    orderBy: { name: 'asc' },
  })

  const leagues = await prisma.league.findMany({
    orderBy: { name: 'asc' },
    include: { country: true },
  })

  const products = rawProducts.map((p: typeof rawProducts[number]) => {
    let images: string[] = []
    try {
      images = JSON.parse(p.images)
    } catch {
      images = [p.images]
    }
    return {
      ...p,
      images,
      variants: p.variants.map((v: typeof p.variants[number]) => ({
        size: v.size as 'S' | 'M' | 'L' | 'XL' | 'XXL',
        stock: v.stock,
      })),
    }
  })

  return (
    <div className="min-h-screen bg-cream-50 text-ink-900 flex flex-col">
      <AdminHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductsManagerClient
          initialProducts={products as any}
          initialCountries={countries as any}
          initialLeagues={leagues as any}
        />
      </main>
    </div>
  )
}
