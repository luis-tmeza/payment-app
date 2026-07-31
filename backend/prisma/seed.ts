import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Aurora Wireless Headphones', description: 'Audifonos inalambricos con cancelacion activa de ruido, carga rapida y estuche compacto.', priceCents: 15990000, stock: 86, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Orbit Mini Speaker', description: 'Parlante portatil resistente al agua, 18 horas de bateria y sonido envolvente.', priceCents: 8990000, stock: 74, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Nova Smartwatch', description: 'Reloj inteligente con monitoreo de actividad, alertas y correa intercambiable.', priceCents: 12490000, stock: 62, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80' },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Pulse Mechanical Keyboard', description: 'Teclado compacto con switches tactiles, iluminacion ajustable y conexion inalambrica.', priceCents: 4290000, stock: 118, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80' },
  { id: '55555555-5555-4555-8555-555555555555', name: 'Halo Desk Lamp', description: 'Lampara de escritorio LED con temperatura regulable, brazo flexible y carga USB-C.', priceCents: 2790000, stock: 67, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80' },
  { id: '66666666-6666-4666-8666-666666666666', name: 'Vertex Webcam', description: 'Camara Full HD con enfoque automatico, microfono dual y cubierta de privacidad.', priceCents: 3490000, stock: 58, imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=1200&q=80' },
  { id: '77777777-7777-4777-8777-777777777777', name: 'Frame USB-C Hub', description: 'Hub de aluminio con HDMI, lector SD y puertos de alta velocidad para tu escritorio.', priceCents: 2190000, stock: 93, imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=1200&q=80' },
  { id: '88888888-8888-4888-8888-888888888888', name: 'Echo Smart Scale', description: 'Bascula inteligente con perfiles familiares, metricas corporales y sincronizacion movil.', priceCents: 1990000, stock: 54, imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80' },
  { id: '99999999-9999-4999-8999-999999999999', name: 'Drift Ergonomic Mouse', description: 'Mouse vertical con desplazamiento preciso, botones programables y bateria recargable.', priceCents: 2390000, stock: 89, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80' },
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Lumen Monitor Light Bar', description: 'Barra de luz para monitor con brillo ajustable, control tactil y sin reflejos en pantalla.', priceCents: 1890000, stock: 71, imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'Atlas Laptop Stand', description: 'Soporte plegable de aluminio con seis niveles de altura para una postura mas comoda.', priceCents: 1690000, stock: 110, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80' },
  { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', name: 'Wave Noise Cancelling Earbuds', description: 'Audifonos compactos con cancelacion hibrida, modo transparencia y estuche de carga.', priceCents: 6490000, stock: 77, imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=80' },
  { id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', name: 'Slate Portable SSD', description: 'Unidad SSD de alta velocidad con carcasa resistente y cable USB-C incluido.', priceCents: 5290000, stock: 65, imageUrl: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=1200&q=80' },
  { id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', name: 'Cove Air Purifier', description: 'Purificador compacto con filtro HEPA, indicador de calidad de aire y modo silencioso.', priceCents: 7390000, stock: 56, imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=80' },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({ where: { id: product.id }, update: product, create: product });
  }
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
