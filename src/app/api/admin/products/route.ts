import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const productVariantSchema = z.object({
  size: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
  stock: z.number().int().min(0),
})

const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  price: z.number().positive('El precio debe ser un número positivo'),
  categoryId: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  countryId: z.string().min(1, 'El país es obligatorio'),
  leagueId: z.string().nullable().optional(),
  images: z.array(z.string()).min(1, 'Debes subir al menos una imagen del producto'),
  featured: z.boolean().default(false),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).default('IN_STOCK'),
  variants: z.array(productVariantSchema).min(1, 'Debes definir el stock por talle'),
})

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        country: true,
        league: true,
        variants: true,
      },
    })
    return NextResponse.json({ products })
  } catch (error) {
    console.error('❌ Error fetching products for admin:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de producto inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const slugBase = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    let slug = slugBase
    let counter = 1
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${counter}`
      counter++
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId || null,
        badge: data.badge || null,
        countryId: data.countryId,
        leagueId: data.leagueId || null,
        images: JSON.stringify(data.images),
        featured: data.featured,
        status: data.status,
        variants: {
          create: data.variants.map((v) => ({
            size: v.size,
            stock: v.stock,
            sku: `${slug.toUpperCase()}-${v.size}`,
          })),
        },
      },
      include: {
        country: true,
        league: true,
        variants: true,
        category: { include: { section: true } },
      },
    })

    // Revalidate public catalog immediately
    revalidatePath('/')

    return NextResponse.json({ success: true, product: createdProduct }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating product:', error)
    return NextResponse.json({ error: 'Error interno al crear el producto' }, { status: 500 })
  }
}
