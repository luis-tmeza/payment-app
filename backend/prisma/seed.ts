import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Aurora Wireless Headphones',
    description: 'Audifonos inalambricos con cancelacion activa de ruido, carga rapida y estuche compacto.',
    priceCents: 15990000,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Orbit Mini Speaker',
    description: 'Parlante portatil resistente al agua, 18 horas de bateria y sonido envolvente.',
    priceCents: 8990000,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Nova Smartwatch',
    description: 'Reloj inteligente con monitoreo de actividad, alertas y correa intercambiable.',
    priceCents: 12490000,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({ where: { id: product.id }, update: product, create: product });
  }
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });