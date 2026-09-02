import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed for DOCE Camisetas...')

  // Clean existing database
  await prisma.payment.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.league.deleteMany()
  await prisma.country.deleteMany()
  await prisma.adminUser.deleteMany()

  // 1. Create Admin User (admin@doce.com.ar / admin123)
  await prisma.adminUser.create({
    data: {
      email: 'admin@doce.com.ar',
      name: 'Admin DOCE',
      password: 'admin123_dev_password_hash',
      role: 'ADMIN',
    },
  })
  console.log('✅ Created Admin User: admin@doce.com.ar')

  // 2. Create Initial Countries
  const countryArg = await prisma.country.create({
    data: { name: 'Argentina', code: 'AR' },
  })
  const countryEsp = await prisma.country.create({
    data: { name: 'España', code: 'ES' },
  })
  const countryIng = await prisma.country.create({
    data: { name: 'Inglaterra', code: 'GB' },
  })
  const countryIta = await prisma.country.create({
    data: { name: 'Italia', code: 'IT' },
  })
  const countryBra = await prisma.country.create({
    data: { name: 'Brasil', code: 'BR' },
  })
  console.log('✅ Created 5 Countries (Argentina, España, Inglaterra, Italia, Brasil)')

  // 3. Create Initial Leagues
  const leagueArg = await prisma.league.create({
    data: {
      name: 'Liga Profesional Argentina',
      countryId: countryArg.id,
      color: '#00A3E0',
    },
  })
  const leagueEsp = await prisma.league.create({
    data: {
      name: 'LaLiga',
      countryId: countryEsp.id,
      color: '#EA580C',
    },
  })
  const leagueIng = await prisma.league.create({
    data: {
      name: 'Premier League',
      countryId: countryIng.id,
      color: '#7C3AED',
    },
  })
  const leagueIta = await prisma.league.create({
    data: {
      name: 'Serie A',
      countryId: countryIta.id,
      color: '#0284C7',
    },
  })
  console.log('✅ Created 4 Leagues (Liga Profesional, LaLiga, Premier League, Serie A)')

  // 4. Sample Products with Generic Football Theme, Countries and Leagues
  const products = [
    {
      name: 'Camiseta Albiceleste Titular 2026',
      slug: 'albiceleste-titular-2026',
      description: 'Camiseta de juego de edición limitada. Confeccionada con poliéster técnico respirable, franjas verticales celestes y blancas con acabado premium, cuello en V y detalles dorados en costuras.',
      price: 45999.00,
      category: 'TITULAR',
      badge: 'DESTACADO',
      countryId: countryArg.id,
      leagueId: leagueArg.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: true,
      variants: [
        { size: 'S', stock: 15, sku: 'ALB-TIT-S' },
        { size: 'M', stock: 22, sku: 'ALB-TIT-M' },
        { size: 'L', stock: 18, sku: 'ALB-TIT-L' },
        { size: 'XL', stock: 10, sku: 'ALB-TIT-XL' },
        { size: 'XXL', stock: 4, sku: 'ALB-TIT-XXL' },
      ],
    },
    {
      name: 'Camiseta Nocturna Suplente Azul Midnight',
      slug: 'nocturna-suplente-azul-midnight',
      description: 'Modelo visitante elegante en tono azul noche profundo con finos micro-patrones geométricos sublimados y bordes plateados en mangas.',
      price: 43999.00,
      category: 'SUPLENTE',
      badge: 'NUEVO',
      countryId: countryEsp.id,
      leagueId: leagueEsp.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1580086319619-3ed498161c77?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: true,
      variants: [
        { size: 'S', stock: 8, sku: 'NOC-SUP-S' },
        { size: 'M', stock: 14, sku: 'NOC-SUP-M' },
        { size: 'L', stock: 12, sku: 'NOC-SUP-L' },
        { size: 'XL', stock: 6, sku: 'NOC-SUP-XL' },
        { size: 'XXL', stock: 2, sku: 'NOC-SUP-XXL' },
      ],
    },
    {
      name: 'Camiseta Retrópolis México 1986',
      slug: 'retropolis-mexico-1986',
      description: 'Homenaje retro a la era dorada del fútbol mundial. Algodón/poliéster ultra suave de época, cuello piqué blanco de botones y número 10 estampado en felpa gruesa.',
      price: 49999.00,
      category: 'RETRO',
      badge: 'RETRO',
      countryId: countryArg.id, // Selección / Retro
      leagueId: null, // Sin liga (Selección)
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: true,
      variants: [
        { size: 'S', stock: 5, sku: 'RET-86-S' },
        { size: 'M', stock: 9, sku: 'RET-86-M' },
        { size: 'L', stock: 7, sku: 'RET-86-L' },
        { size: 'XL', stock: 3, sku: 'RET-86-XL' },
        { size: 'XXL', stock: 0, sku: 'RET-86-XXL' },
      ],
    },
    {
      name: 'Camiseta Arquero Neón Shield',
      slug: 'arquero-neon-shield',
      description: 'Diseñada para destacar bajo los tres palos. Color verde neón vibrante con acolchado estratégico de protección en codos y tejido Dri-Mesh lateral.',
      price: 47999.00,
      category: 'ARQUERO',
      badge: 'NUEVO',
      countryId: countryIng.id,
      leagueId: leagueIng.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: false,
      variants: [
        { size: 'S', stock: 4, sku: 'ARQ-NEO-S' },
        { size: 'M', stock: 6, sku: 'ARQ-NEO-M' },
        { size: 'L', stock: 8, sku: 'ARQ-NEO-L' },
        { size: 'XL', stock: 5, sku: 'ARQ-NEO-XL' },
        { size: 'XXL', stock: 1, sku: 'ARQ-NEO-XXL' },
      ],
    },
    {
      name: 'Camiseta Retrópolis Italia 1990',
      slug: 'retropolis-italia-1990',
      description: 'Diseño clásico retro de los 90. Cuello redondo con ribete tricolor, tejido jacquard brillante y ajuste holgado vintage tradicional.',
      price: 48999.00,
      category: 'RETRO',
      badge: 'RETRO',
      countryId: countryIta.id,
      leagueId: leagueIta.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: false,
      variants: [
        { size: 'S', stock: 6, sku: 'RET-90-S' },
        { size: 'M', stock: 11, sku: 'RET-90-M' },
        { size: 'L', stock: 10, sku: 'RET-90-L' },
        { size: 'XL', stock: 4, sku: 'RET-90-XL' },
        { size: 'XXL', stock: 2, sku: 'RET-90-XXL' },
      ],
    },
    {
      name: 'Camiseta Arquero Negro Azabache',
      slug: 'arquero-negro-azabache',
      description: 'Presencia imponente en el arco. Edición total black con detalles sutiles en antracita mate y refuerzo en puños.',
      price: 46999.00,
      category: 'ARQUERO',
      badge: 'OPORTUNIDAD',
      countryId: countryArg.id,
      leagueId: leagueArg.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: false,
      variants: [
        { size: 'S', stock: 3, sku: 'ARQ-BLK-S' },
        { size: 'M', stock: 8, sku: 'ARQ-BLK-M' },
        { size: 'L', stock: 5, sku: 'ARQ-BLK-L' },
        { size: 'XL', stock: 2, sku: 'ARQ-BLK-XL' },
        { size: 'XXL', stock: 1, sku: 'ARQ-BLK-XXL' },
      ],
    },
  ]

  for (const prodData of products) {
    const { variants, ...productInfo } = prodData
    const createdProduct = await prisma.product.create({
      data: {
        ...productInfo,
        variants: {
          create: variants,
        },
      },
    })
    console.log(`👕 Created Product: ${createdProduct.name} (${variants.length} variants)`)
  }

  // 5. Create Sample Initial Orders
  const customer = await prisma.customer.create({
    data: {
      email: 'juan.perez@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      dni: '38123456',
      phone: '1198765432',
      address: 'Av. Corrientes 1234, 4to B',
      city: 'Ciudad Autónoma de Buenos Aires',
      province: 'CABA',
      postalCode: 'C1043',
    },
  })

  const sampleVariant = await prisma.productVariant.findFirst()
  if (sampleVariant) {
    const order = await prisma.order.create({
      data: {
        orderNumber: 'DOCE-1001',
        customerId: customer.id,
        status: 'PAID',
        subtotal: 45999.00,
        shippingFee: 3500.00,
        totalAmount: 49499.00,
        courier: 'ANDREANI',
        trackingCode: 'AND-89472910',
        shippingAddress: JSON.stringify({
          address: 'Av. Corrientes 1234',
          city: 'CABA',
          postalCode: 'C1043',
        }),
        items: {
          create: [
            {
              variantId: sampleVariant.id,
              quantity: 1,
              unitPrice: 45999.00,
            },
          ],
        },
        payments: {
          create: [
            {
              mpPaymentId: 'MP-987654321',
              status: 'approved',
              paymentMethodId: 'account_money',
            },
          ],
        },
        shipments: {
          create: [
            {
              courier: 'ANDREANI',
              trackingNumber: 'AND-89472910',
              status: 'GENERATED',
            },
          ],
        },
      },
    })
    console.log(`📦 Created Initial Sample Order: ${order.orderNumber}`)
  }

  console.log('✅ Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
