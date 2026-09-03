import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed for PielFutbolera...')

  await prisma.payment.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.section.deleteMany()
  await prisma.league.deleteMany()
  await prisma.country.deleteMany()
  await prisma.adminUser.deleteMany()

  // 1. Admin
  await prisma.adminUser.create({
    data: {
      email: 'admin@pielfutbolera.com.ar',
      name: 'Admin PielFutbolera',
      password: 'admin123_dev_password_hash',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user: admin@pielfutbolera.com.ar / admin123')

  // 2. Countries
  const countryArg = await prisma.country.create({ data: { name: 'Argentina', code: 'AR' } })
  const countryEsp = await prisma.country.create({ data: { name: 'España', code: 'ES' } })
  const countryIng = await prisma.country.create({ data: { name: 'Inglaterra', code: 'GB' } })
  const countryIta = await prisma.country.create({ data: { name: 'Italia', code: 'IT' } })
  const countryBra = await prisma.country.create({ data: { name: 'Brasil', code: 'BR' } })
  console.log('✅ 5 countries')

  // 3. Leagues
  const leagueArg = await prisma.league.create({ data: { name: 'Liga Profesional Argentina', countryId: countryArg.id, color: '#00A3E0' } })
  const leagueEsp = await prisma.league.create({ data: { name: 'LaLiga', countryId: countryEsp.id, color: '#EA580C' } })
  const leagueIng = await prisma.league.create({ data: { name: 'Premier League', countryId: countryIng.id, color: '#7C3AED' } })
  const leagueIta = await prisma.league.create({ data: { name: 'Serie A', countryId: countryIta.id, color: '#0284C7' } })
  console.log('✅ 4 leagues')

  // 4. Sections (top-level)
  const secCamisetas = await prisma.section.create({
    data: {
      slug: 'camisetas',
      name: 'Camisetas',
      description: 'Camisetas de juego, hincha y ediciones especiales',
      order: 1,
    },
  })
  const secShorts = await prisma.section.create({
    data: { slug: 'shorts', name: 'Shorts', description: 'Shorts de juego y entrenamiento', order: 2 },
  })
  const secCamperas = await prisma.section.create({
    data: { slug: 'camperas', name: 'Camperas', description: 'Camperas, buzos y abrigos deportivos', order: 3 },
  })
  const secConjuntos = await prisma.section.create({
    data: { slug: 'conjuntos', name: 'Conjuntos', description: 'Conjuntos completos de entrenamiento y match-day', order: 4 },
  })
  console.log('✅ 4 sections: Camisetas, Shorts, Camperas, Conjuntos')

  // 5. Categories (sub-categorías dentro de cada sección)
  const catJugador = await prisma.category.create({
    data: { slug: 'version-jugador', name: 'Versión Jugador', sectionId: secCamisetas.id, order: 1, description: 'Camisetas de juego profesional' },
  })
  const catHincha = await prisma.category.create({
    data: { slug: 'hincha', name: 'Hincha', sectionId: secCamisetas.id, order: 2, description: 'Camisetas para el día a día' },
  })
  const catRetro = await prisma.category.create({
    data: { slug: 'retro', name: 'Retro', sectionId: secCamisetas.id, order: 3, description: 'Ediciones retro y homenaje' },
  })
  const catMangaLarga = await prisma.category.create({
    data: { slug: 'manga-larga', name: 'Manga Larga', sectionId: secCamisetas.id, order: 4, description: 'Camisetas de manga larga' },
  })
  const catIconTerrace = await prisma.category.create({
    data: { slug: 'icon-terrace', name: 'Icon Terrace', sectionId: secCamisetas.id, order: 5, description: 'Edición terrace lifestyle' },
  })
  const catOasis = await prisma.category.create({
    data: { slug: 'coleccion-oasis-25', name: "Colección Oasis '25", sectionId: secCamisetas.id, order: 6, description: 'Colección cápsula Oasis 2025' },
  })
  const catSuplentes = await prisma.category.create({
    data: { slug: 'suplentes', name: 'Suplentes', sectionId: secCamisetas.id, order: 7, description: 'Camisetas alternativas y suplentes' },
  })
  const catArquero = await prisma.category.create({
    data: { slug: 'arquero', name: 'Arquero', sectionId: secCamisetas.id, order: 8, description: 'Equipación de arquero' },
  })

  // Sub-categorías para Shorts
  await prisma.category.create({ data: { slug: 'shorts-juego', name: 'Shorts de Juego', sectionId: secShorts.id, order: 1 } })
  await prisma.category.create({ data: { slug: 'shorts-entrenamiento', name: 'Shorts de Entrenamiento', sectionId: secShorts.id, order: 2 } })

  // Sub-categorías para Camperas
  await prisma.category.create({ data: { slug: 'camperas-stadium', name: 'Camperas Stadium', sectionId: secCamperas.id, order: 1 } })
  await prisma.category.create({ data: { slug: 'buzos', name: 'Buzos', sectionId: secCamperas.id, order: 2 } })

  // Sub-categorías para Conjuntos
  await prisma.category.create({ data: { slug: 'conjuntos-entrenamiento', name: 'Conjuntos de Entrenamiento', sectionId: secConjuntos.id, order: 1 } })
  await prisma.category.create({ data: { slug: 'conjuntos-match-day', name: 'Conjuntos Match Day', sectionId: secConjuntos.id, order: 2 } })

  console.log('✅ 6 categorías en Camisetas + sub-categorías en Shorts, Camperas y Conjuntos')

  // 6. Sample products (uno por cada categoría de Camisetas para tener data en el admin)
  const productsSeed = [
    {
      name: 'Camiseta Albiceleste Titular 2026',
      slug: 'albiceleste-titular-2026',
      description: 'Camiseta de juego de edición limitada. Confeccionada con poliéster técnico respirable, franjas verticales celestes y blancas con acabado premium, cuello en V y detalles dorados en costuras.',
      price: 45999.00,
      badge: 'DESTACADO',
      countryId: countryArg.id,
      leagueId: leagueArg.id,
      categoryId: catJugador.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80',
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
      name: 'Camiseta Albiceleste Hincha 2026',
      slug: 'albiceleste-hincha-2026',
      description: 'Versión para el hincha del día a día. Tela suave y respirable, corte clásico con escudo bordado.',
      price: 38999.00,
      badge: 'NUEVO',
      countryId: countryArg.id,
      leagueId: leagueArg.id,
      categoryId: catHincha.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1580086319619-3ed498161c77?auto=format&fit=crop&w=800&q=80']),
      featured: false,
      variants: [
        { size: 'S', stock: 20, sku: 'ALB-HIN-S' },
        { size: 'M', stock: 25, sku: 'ALB-HIN-M' },
        { size: 'L', stock: 22, sku: 'ALB-HIN-L' },
        { size: 'XL', stock: 12, sku: 'ALB-HIN-XL' },
      ],
    },
    {
      name: 'Camiseta Retrópolis México 1986',
      slug: 'retropolis-mexico-1986',
      description: 'Homenaje retro a la era dorada del fútbol mundial. Algodón/poliéster ultra suave, cuello piqué blanco de botones.',
      price: 49999.00,
      badge: 'RETRO',
      countryId: countryArg.id,
      leagueId: null,
      categoryId: catRetro.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80']),
      featured: true,
      variants: [
        { size: 'S', stock: 5, sku: 'RET-86-S' },
        { size: 'M', stock: 9, sku: 'RET-86-M' },
        { size: 'L', stock: 7, sku: 'RET-86-L' },
        { size: 'XL', stock: 3, sku: 'RET-86-XL' },
      ],
    },
    {
      name: 'Camiseta Manga Larga Premium',
      slug: 'manga-larga-premium',
      description: 'Camiseta de manga larga para entretiempo. Cuello alto con cierre, tela térmica.',
      price: 42500.00,
      badge: 'NUEVO',
      countryId: countryEsp.id,
      leagueId: leagueEsp.id,
      categoryId: catMangaLarga.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=800&q=80']),
      featured: false,
      variants: [
        { size: 'M', stock: 10, sku: 'ML-PRE-M' },
        { size: 'L', stock: 12, sku: 'ML-PRE-L' },
        { size: 'XL', stock: 6, sku: 'ML-PRE-XL' },
      ],
    },
    {
      name: 'Camiseta Icon Terrace Heritage',
      slug: 'icon-terrace-heritage',
      description: 'Edición terrace lifestyle. Inspirada en las camisetas icónicas que se ven en las tribunas europeas.',
      price: 41500.00,
      badge: 'DESTACADO',
      countryId: countryIng.id,
      leagueId: leagueIng.id,
      categoryId: catIconTerrace.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80']),
      featured: true,
      variants: [
        { size: 'S', stock: 8, sku: 'IC-TER-S' },
        { size: 'M', stock: 12, sku: 'IC-TER-M' },
        { size: 'L', stock: 10, sku: 'IC-TER-L' },
        { size: 'XL', stock: 4, sku: 'IC-TER-XL' },
      ],
    },
    {
      name: "Camiseta Colección Oasis '25",
      slug: 'coleccion-oasis-25',
      description: 'Colección cápsula de verano con colores cálidos y materiales livianos. Edición limitada.',
      price: 39999.00,
      badge: 'RETRO',
      countryId: countryBra.id,
      leagueId: null,
      categoryId: catOasis.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80']),
      featured: false,
      variants: [
        { size: 'S', stock: 6, sku: 'OAS-25-S' },
        { size: 'M', stock: 9, sku: 'OAS-25-M' },
        { size: 'L', stock: 7, sku: 'OAS-25-L' },
      ],
    },
    {
      name: 'Camiseta Suplente 2026',
      slug: 'camiseta-suplente-2026',
      description: 'Camiseta alternativa para el banco. Diseño en tonos oscuros con detalles fluorescentes y tejido dry-fit de alto rendimiento.',
      price: 42999.00,
      badge: 'NUEVO',
      countryId: countryArg.id,
      leagueId: leagueArg.id,
      categoryId: catSuplentes.id,
      images: JSON.stringify(['/categorias/suplentes.webp']),
      featured: true,
      variants: [
        { size: 'S', stock: 12, sku: 'SUP-26-S' },
        { size: 'M', stock: 18, sku: 'SUP-26-M' },
        { size: 'L', stock: 14, sku: 'SUP-26-L' },
        { size: 'XL', stock: 6, sku: 'SUP-26-XL' },
        { size: 'XXL', stock: 3, sku: 'SUP-26-XXL' },
      ],
    },
    {
      name: 'Camiseta Arquero Pro 2026',
      slug: 'camiseta-arquero-pro-2026',
      description: 'Equipación profesional de arquero. Corte oversize, padding ligero en codos, gráfico geométrico high-visibility.',
      price: 47500.00,
      badge: 'DESTACADO',
      countryId: countryBra.id,
      leagueId: null,
      categoryId: catArquero.id,
      images: JSON.stringify(['/categorias/arquero.webp']),
      featured: true,
      variants: [
        { size: 'S', stock: 8, sku: 'ARQ-26-S' },
        { size: 'M', stock: 11, sku: 'ARQ-26-M' },
        { size: 'L', stock: 9, sku: 'ARQ-26-L' },
        { size: 'XL', stock: 5, sku: 'ARQ-26-XL' },
      ],
    },
  ]

  for (const prodData of productsSeed) {
    const { variants, ...productInfo } = prodData
    const created = await prisma.product.create({
      data: { ...productInfo, variants: { create: variants } },
    })
    console.log(`👕 ${created.name} (${variants.length} talles)`)
  }

  console.log('✅ Seed completo: admin, países, ligas, 4 secciones, 12 categorías, 6 productos de ejemplo')
}

main()
  .catch((e) => { console.error('❌ Error during seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
