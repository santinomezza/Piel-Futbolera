import React from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { ProductDetailView } from '@/components/store/ProductDetailView'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 0

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) return { title: 'Producto no encontrado | PielFutbolera' }
  return {
    title: `${product.name} | PielFutbolera`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const rawProduct = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: {
        orderBy: {
          size: 'asc',
        },
      },
    },
  })

  if (!rawProduct) {
    notFound()
  }

  let images: string[] = []
  try {
    images = JSON.parse(rawProduct.images)
  } catch {
    images = [rawProduct.images]
  }

  const product = {
    ...rawProduct,
    images,
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductDetailView product={product} />
      </main>
      <Footer />
    </div>
  )
}
