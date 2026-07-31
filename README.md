# Payment App

Aplicacion de pagos para una prueba tecnica Full Stack de Wompi. El repositorio es un monorepo con una SPA de catalogo y checkout, y una API NestJS que integra Wompi Sandbox, PostgreSQL y gestion transaccional de inventario.

## Demo publica

- Frontend: https://d1ex8u4v10ds8r.cloudfront.net
- API: https://payment-api-ssia.onrender.com/api
- Salud: https://payment-api-ssia.onrender.com/api/health
- Swagger: https://payment-api-ssia.onrender.com/docs

El backend usa el plan gratuito de Render y puede tardar alrededor de un minuto en responder tras un periodo sin solicitudes.

## Stack

- Frontend: Vue 3, TypeScript, Vite, Vuex 4, Vue Router, Lucide y Vitest.
- Backend: NestJS, TypeScript, Prisma, PostgreSQL, Swagger y Jest.
- Pagos: Wompi Sandbox, tokenizacion de tarjeta, documentos de aceptacion, consulta de estado y webhook firmado.
- Infraestructura: CloudFront + S3 para frontend y Render + Neon PostgreSQL para API y base de datos.
- Arquitectura: hexagonal en backend, con dominio, casos de uso, puertos y adaptadores.

## Estructura

~~~text
payment-app/
  frontend/                 Vue SPA
  backend/                  NestJS API y Prisma
  docs/postman/             Coleccion Postman
  docs/DELIVERY.md          Guia de entrega y validacion
  infrastructure/aws/       Plantilla CloudFormation del frontend
  scripts/deploy-frontend.ps1
  docker-compose.yml        Entorno local con PostgreSQL, API y SPA
~~~

## Funcionalidades

1. Catalogo responsive con multiples productos, precio, disponibilidad e imagen.
2. Vista de detalle, compra directa y cantidades editables con validacion de enteros y stock.
3. Carrito persistente, edicion de cantidades, subtotal y checkout de multiples lineas.
4. Formulario de pago con validacion de tarjeta, fecha, CVC, cliente y direccion.
5. Vista previa de tarjeta que rota al editar el CVC.
6. Documentos de aceptacion actuales de Wompi y consentimientos obligatorios.
7. Tokenizacion, integridad de transaccion y pago mediante Wompi Sandbox.
8. Reserva atomica de inventario, idempotencia y conciliacion por polling/webhook.
9. Resultado de pago, entrega asignada al aprobar y liberacion de inventario ante rechazo o error.
10. No se persisten PAN ni CVC: solo franquicia y ultimos cuatro digitos.

## Requisitos locales

- Node.js 22 o superior.
- pnpm 9 o superior.
- Docker Desktop.
- Credenciales de Wompi Sandbox definidas solo en backend/.env.

## Ejecucion local

1. Instala las dependencias.

~~~bash
pnpm install
~~~

2. Crea backend/.env desde backend/.env.example y completa los secretos locales.

~~~dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/payment_app?schema=public"
WOMPI_BASE_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=pub_test_xxx
WOMPI_PRIVATE_KEY=prv_test_xxx
WOMPI_INTEGRITY_SECRET=xxx
WOMPI_EVENTS_SECRET=xxx
WEB_ORIGIN=http://localhost:5173
~~~

3. Inicia el entorno completo.

~~~powershell
docker compose up --build
~~~

4. Carga el catalogo de demostracion una sola vez.

~~~powershell
docker compose exec backend pnpm --dir backend prisma:seed
~~~

- Frontend: http://localhost:5173
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/docs

Para detenerlo ejecuta docker compose down. Agrega -v solo si deseas eliminar tambien la base de datos local.

## Pruebas y calidad

~~~bash
pnpm test
pnpm test:coverage
pnpm build
~~~

La ejecucion validada cumple el minimo de cobertura solicitado:

| Proyecto | Sentencias | Ramas | Funciones | Lineas |
| --- | ---: | ---: | ---: | ---: |
| Frontend | 92.42% | 86.61% | 87.23% | 92.42% |
| Backend (nucleo de aplicacion) | 92.13% | 84.21% | 100% | 94.36% |

GitHub Actions valida pruebas y builds en develop y main.

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /api/health | Estado del servicio |
| GET | /api/products | Catalogo de productos |
| GET | /api/products/featured | Producto destacado |
| GET | /api/checkout/acceptance-documents | Documentos actuales de Wompi |
| POST | /api/checkout/transactions | Crea y procesa una transaccion |
| GET | /api/checkout/transactions/:reference | Consulta una transaccion |
| POST | /api/checkout/wompi/events | Recibe eventos firmados de Wompi |

La coleccion esta disponible en [docs/postman/payment-app.postman_collection.json](docs/postman/payment-app.postman_collection.json).

## Arquitectura backend

- domain/: entidades, tipos y reglas de negocio.
- application/: casos de uso y puertos.
- infrastructure/: adaptadores Prisma, Wompi y HTTP.
- modules/: composicion de dependencias de NestJS.

Los controladores traducen HTTP a casos de uso. El puerto PaymentGateway permite reemplazar la pasarela sin modificar la logica de negocio.

## Despliegue

El frontend se publica en S3 y CloudFront. La API se despliega en Render, ejecuta migraciones con Prisma al iniciar y usa Neon PostgreSQL.

~~~powershell
.\scripts\deploy-frontend.ps1 -ApiBaseUrl "https://payment-api-ssia.onrender.com/api" -BucketName "payment-app-522895896247-20260731" -DistributionId "E138CKUO63MEF7"
~~~

En Render deben existir DATABASE_URL, WEB_ORIGIN y los secretos de Wompi. Esos valores se configuran como secretos de entorno y no se versionan.

La configuracion final de eventos de Wompi se describe en [docs/DELIVERY.md](docs/DELIVERY.md).