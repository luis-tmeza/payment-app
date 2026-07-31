import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Aurora Wireless Headphones', description: 'Audifonos inalambricos con cancelacion activa de ruido, carga rapida y estuche compacto.', priceCents: 15990000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Orbit Mini Speaker', description: 'Parlante portatil resistente al agua, 18 horas de bateria y sonido envolvente.', priceCents: 8990000, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Nova Smartwatch', description: 'Reloj inteligente con monitoreo de actividad, alertas y correa intercambiable.', priceCents: 12490000, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80' },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Pulse Mechanical Keyboard', description: 'Teclado compacto con switches tactiles, iluminacion ajustable y conexion inalambrica.', priceCents: 4290000, stock: 16, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80' },
  { id: '55555555-5555-4555-8555-555555555555', name: 'Halo Desk Lamp', description: 'Lampara de escritorio LED con temperatura regulable, brazo flexible y carga USB-C.', priceCents: 2790000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80' },
  { id: '66666666-6666-4666-8666-666666666666', name: 'Vertex Webcam', description: 'Camara Full HD con enfoque automatico, microfono dual y cubierta de privacidad.', priceCents: 3490000, stock: 7, imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=1200&q=80' },
  { id: '77777777-7777-4777-8777-777777777777', name: 'Frame USB-C Hub', description: 'Hub de aluminio con HDMI, lector SD y puertos de alta velocidad para tu escritorio.', priceCents: 2190000, stock: 14, imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=1200&q=80' },
  { id: '88888888-8888-4888-8888-888888888888', name: 'Echo Smart Scale', description: 'Bascula inteligente con perfiles familiares, metricas corporales y sincronizacion movil.', priceCents: 1990000, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80' },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({ where: { id: product.id }, update: product, create: product });
  }
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
