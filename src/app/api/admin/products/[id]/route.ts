import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const updateProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  price: z.number().positive('El precio debe ser un número positivo'),
  category: z.enum(['TITULAR', 'SUPLENTE', 'RETRO', 'ARQUERO']),
  badge: z.string().nullable().optional(),
  countryId: z.string().min(1, 'El país es obligatorio'),
  leagueId: z.string().nullable().optional(),
  images: z.array(z.string()).min(1, 'Debes subir al menos una imagen del producto'),
  featured: z.boolean(),
  isDeleted: z.boolean().optional(),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']),
  variants: z.array(
    z.object({
      size: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
      stock: z.number().int().min(0),
    })
  ),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de producto inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Update main product details
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        badge: data.badge || null,
        countryId: data.countryId,
        leagueId: data.leagueId || null,
        images: JSON.stringify(data.images),
        featured: data.featured,
        isDeleted: data.isDeleted ?? existingProduct.isDeleted,
        status: data.status,
      },
    })

    // Upsert variants stock
    for (const v of data.variants) {
      const existingVariant = existingProduct.variants.find((ev) => ev.size === v.size)
      if (existingVariant) {
        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: { stock: v.stock },
        })
      } else {
        await prisma.productVariant.create({
          data: {
            productId: id,
            size: v.size,
            stock: v.stock,
            sku: `${existingProduct.slug.toUpperCase()}-${v.size}`,
          },
        })
      }
    }

    // Revalidate store page
    revalidatePath('/')
    revalidatePath(`/producto/${existingProduct.slug}`)

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error('❌ Error updating product:', error)
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Perform soft delete to preserve orders history
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    })

    // Revalidate public catalog
    revalidatePath('/')
    revalidatePath(`/producto/${existingProduct.slug}`)

    return NextResponse.json({
      success: true,
      message: 'Producto ocultado/eliminado correctamente (soft delete)',
    })
  } catch (error) {
    console.error('❌ Error deleting product:', error)
    return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 })
  }
}
