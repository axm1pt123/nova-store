import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const customerPassword = await bcrypt.hash('Customer123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.local' },
    update: {},
    create: {
      email: 'admin@ecommerce.local',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@ecommerce.local' },
    update: {},
    create: {
      email: 'customer@ecommerce.local',
      passwordHash: customerPassword,
      firstName: 'Demo',
      lastName: 'Customer',
      role: UserRole.CUSTOMER,
    },
  });

  // ── Categorías ──────────────────────────────────────────────
  const mujerRopa = await prisma.category.upsert({
    where: { slug: 'mujer-ropa' },
    update: { name: 'Ropa Mujer', description: 'Prendas de vestir para mujer' },
    create: { name: 'Ropa Mujer', slug: 'mujer-ropa', description: 'Prendas de vestir para mujer' },
  });

  const mujerAccesorios = await prisma.category.upsert({
    where: { slug: 'mujer-accesorios' },
    update: { name: 'Accesorios Mujer', description: 'Carteras, joyería y accesorios para mujer' },
    create: { name: 'Accesorios Mujer', slug: 'mujer-accesorios', description: 'Carteras, joyería y accesorios para mujer' },
  });

  const mujerCalzado = await prisma.category.upsert({
    where: { slug: 'mujer-calzado' },
    update: { name: 'Calzado Mujer', description: 'Zapatos, sandalias y botas para mujer' },
    create: { name: 'Calzado Mujer', slug: 'mujer-calzado', description: 'Zapatos, sandalias y botas para mujer' },
  });

  const hombreRopa = await prisma.category.upsert({
    where: { slug: 'hombre-ropa' },
    update: { name: 'Ropa Hombre', description: 'Prendas de vestir para hombre' },
    create: { name: 'Ropa Hombre', slug: 'hombre-ropa', description: 'Prendas de vestir para hombre' },
  });

  const hombreAccesorios = await prisma.category.upsert({
    where: { slug: 'hombre-accesorios' },
    update: { name: 'Accesorios Hombre', description: 'Relojes, cinturones y accesorios para hombre' },
    create: { name: 'Accesorios Hombre', slug: 'hombre-accesorios', description: 'Relojes, cinturones y accesorios para hombre' },
  });

  const hombreCalzado = await prisma.category.upsert({
    where: { slug: 'hombre-calzado' },
    update: { name: 'Calzado Hombre', description: 'Zapatillas, mocasines y botas para hombre' },
    create: { name: 'Calzado Hombre', slug: 'hombre-calzado', description: 'Zapatillas, mocasines y botas para hombre' },
  });

  // ── Productos (precios en Bolivianos) ───────────────────────
  const products = [
    // Ropa Mujer
    {
      slug: 'vestido-midi-floral',
      name: 'Vestido Midi Floral',
      description: 'Vestido midi de tela liviana con estampado floral, perfecto para el verano. Tiro medio, falda con vuelo. Composición: 95% viscosa, 5% elastano.',
      priceCents: 35000,
      currency: 'BOB',
      stock: 30,
      categoryId: mujerRopa.id,
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop',
    },
    {
      slug: 'blusa-oversize-satin',
      name: 'Blusa Oversize Satén',
      description: 'Blusa oversize de satén con escote en V, manga larga con puños. Ideal para oficina o salida casual. 100% poliéster satinado, caída suave.',
      priceCents: 18000,
      currency: 'BOB',
      stock: 50,
      categoryId: mujerRopa.id,
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-f8d2f6781a34?w=600&h=600&fit=crop',
    },
    {
      slug: 'conjunto-lino-mujer',
      name: 'Conjunto de Lino',
      description: 'Conjunto de pantalón y camisa en lino natural. Fresco y elegante para cualquier ocasión. Tela transpirable ideal para climas cálidos.',
      priceCents: 45000,
      currency: 'BOB',
      stock: 20,
      categoryId: mujerRopa.id,
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop',
    },
    {
      slug: 'falda-plisada-midi',
      name: 'Falda Plisada Midi',
      description: 'Falda midi plisada de tiro alto. Cintura elástica cómoda. Disponible en negro, beige y verde oliva. Cae perfectamente al caminar.',
      priceCents: 22000,
      currency: 'BOB',
      stock: 35,
      categoryId: mujerRopa.id,
      imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5218a2e2b9?w=600&h=600&fit=crop',
    },

    // Accesorios Mujer
    {
      slug: 'cartera-mini-chain',
      name: 'Cartera Mini Chain',
      description: 'Mini cartera de cuero vegano con cadena dorada desmontable. Compartimento principal con cierre magnético y bolsillo interior con cremallera. Dimensiones: 20x14x6 cm.',
      priceCents: 48000,
      currency: 'BOB',
      stock: 15,
      categoryId: mujerAccesorios.id,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    },
    {
      slug: 'collar-perlas-doradas',
      name: 'Collar Perlas Doradas',
      description: 'Collar de perlas artificiales con baño en oro 18k. Largo regulable entre 40 y 45 cm. Cierre de mosquetón. Hipoalergénico.',
      priceCents: 14000,
      currency: 'BOB',
      stock: 40,
      categoryId: mujerAccesorios.id,
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
    },
    {
      slug: 'panuelo-seda-mujer',
      name: 'Pañuelo de Seda',
      description: 'Pañuelo 100% seda con estampado geométrico en colores tierra. 90x90 cm. Multifuncional: cuello, cabello, cartera o muñeca.',
      priceCents: 11000,
      currency: 'BOB',
      stock: 25,
      categoryId: mujerAccesorios.id,
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop',
    },

    // Calzado Mujer
    {
      slug: 'zapatos-tacon-kitten',
      name: 'Zapatos Kitten Heel',
      description: 'Zapatos de taco bajo (kitten heel 4 cm) en cuero genuino. Puntera fina, suela de goma antideslizante. Interior forrado en cuero suave. Disponibles en negro y nude.',
      priceCents: 38000,
      currency: 'BOB',
      stock: 20,
      categoryId: mujerCalzado.id,
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop',
    },
    {
      slug: 'sandalias-planas-tiras',
      name: 'Sandalias Planas Tiras',
      description: 'Sandalias planas de tiras cruzadas en cuero vegano. Cierre de hebilla lateral ajustable. Plantilla acolchada de espuma de memoria. Perfectas para el verano.',
      priceCents: 26000,
      currency: 'BOB',
      stock: 35,
      categoryId: mujerCalzado.id,
      imageUrl: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&h=600&fit=crop',
    },

    // Ropa Hombre
    {
      slug: 'camisa-oxford-hombre',
      name: 'Camisa Oxford Classic',
      description: 'Camisa de cuadros oxford 100% algodón peinado. Corte regular, cuello button-down, puños con botón. Ideal para looks formales o casuales con jeans.',
      priceCents: 30000,
      currency: 'BOB',
      stock: 40,
      categoryId: hombreRopa.id,
      imageUrl: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=600&fit=crop',
    },
    {
      slug: 'pantalon-chino-slim',
      name: 'Pantalón Chino Slim',
      description: 'Pantalón chino de corte slim fit en algodón elástico 98/2. Cinco bolsillos, cintura con pasadores. Lavable a máquina. Disponible en beige, verde y azul marino.',
      priceCents: 34000,
      currency: 'BOB',
      stock: 30,
      categoryId: hombreRopa.id,
      imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop',
    },
    {
      slug: 'camiseta-premium-hombre',
      name: 'Camiseta Premium',
      description: 'Camiseta de algodón pima 180g/m². Cuello redondo reforzado con cinta interior, costuras dobles en mangas y bajo. Colores sólidos que no decoloran.',
      priceCents: 14000,
      currency: 'BOB',
      stock: 60,
      categoryId: hombreRopa.id,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    },
    {
      slug: 'blazer-structured-hombre',
      name: 'Blazer Structured',
      description: 'Blazer de corte entallado en tela técnica anti-arrugas. Solapas en pico, dos bolsillos delanteros con vivo y uno interior. Forro completo. Perfecto para oficina o eventos.',
      priceCents: 72000,
      currency: 'BOB',
      stock: 15,
      categoryId: hombreRopa.id,
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=600&fit=crop',
    },

    // Accesorios Hombre
    {
      slug: 'reloj-clasico-cuero',
      name: 'Reloj Clásico Cuero',
      description: 'Reloj analógico con correa de cuero genuino marrón cosida a mano. Caja de acero inoxidable 40mm, cristal mineral, sumergible 3ATM. Movimiento japonés Miyota.',
      priceCents: 72000,
      currency: 'BOB',
      stock: 10,
      categoryId: hombreAccesorios.id,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    },
    {
      slug: 'cinturon-cuero-hombre',
      name: 'Cinturón Cuero',
      description: 'Cinturón de cuero genuino curtido al vegetal, oscurece con el uso ganando carácter. Hebilla de acero inoxidable plateado. Ancho 3.5 cm. Tallas S a XL.',
      priceCents: 22000,
      currency: 'BOB',
      stock: 25,
      categoryId: hombreAccesorios.id,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
    },
    {
      slug: 'cartera-bifold-hombre',
      name: 'Billetera Bifold',
      description: 'Billetera bifold de cuero genuino italiano full-grain. 6 ranuras para tarjetas, compartimento para billetes con separador. Ultra delgada (7mm cerrada).',
      priceCents: 16800,
      currency: 'BOB',
      stock: 30,
      categoryId: hombreAccesorios.id,
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594785?w=600&h=600&fit=crop',
    },

    // Calzado Hombre
    {
      slug: 'zapatillas-urbanas-hombre',
      name: 'Zapatillas Urbanas',
      description: 'Zapatillas de cuero genuino y lona con suela vulcanizada de goma. Diseño limpio y minimalista. Forro interior de algodón transpirable. Suela cosida para mayor durabilidad.',
      priceCents: 44000,
      currency: 'BOB',
      stock: 20,
      categoryId: hombreCalzado.id,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    },
    {
      slug: 'mocasines-cuero-hombre',
      name: 'Mocasines de Cuero',
      description: 'Mocasines de cuero pulido con detalle de borla trenzada. Suela de cuero cosida Blake. Plantilla anatómica removible de cuero. Elegantes y cómodos para uso diario.',
      priceCents: 52000,
      currency: 'BOB',
      stock: 15,
      categoryId: hombreCalzado.id,
      imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=600&fit=crop',
    },
  ];

  let created = 0;
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
      },
      create: product,
    });
    created++;
  }

  console.log(`✅ Admin: ${admin.email} / Admin123!`);
  console.log(`✅ Customer: ${customer.email} / Customer123!`);
  console.log(`✅ 6 categorías (Mujer + Hombre)`);
  console.log(`✅ ${created} productos de moda`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
