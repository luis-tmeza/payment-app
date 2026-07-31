# Payment App

Aplicacion de checkout para una prueba tecnica Full Stack. Implementa un producto con inventario, pago con tarjeta mediante Wompi Sandbox, entrega, trazabilidad de transaccion y una SPA responsive.

## Stack

- Frontend: Vue 3, TypeScript, Vite, Vuex 4, Vue Router y Vitest.
- Backend: NestJS, TypeScript, Prisma, PostgreSQL, Swagger y Jest.
- Integracion: Wompi Sandbox por API, tokenizacion de tarjeta, documentos de aceptacion y polling de estado.
- Arquitectura: hexagonal en backend mediante dominio, casos de uso, puertos y adaptadores.

## Estructura

```text
payment-app/
  frontend/                 Vue SPA
  backend/                  NestJS API y Prisma
  docs/postman/             Coleccion Postman
  docker-compose.yml        PostgreSQL local
```

## Flujo implementado

1. Consulta y muestra el producto disponible, su precio y stock.
2. Captura tarjeta, datos de cliente y direccion de entrega en modal responsive.
3. Detecta Visa/Mastercard y valida numero, fecha, CVV y formulario.
4. Consulta los documentos de aceptacion actuales de Wompi y exige ambos consentimientos.
5. Crea una transaccion interna `PENDING`, tokeniza la tarjeta y crea el pago en Wompi.
6. Consulta el estado final; si aprueba, asigna la entrega y actualiza el inventario.
7. Muestra resultado final y vuelve a cargar el producto.

No se persisten PAN ni CVV. Solo se guarda franquicia y ultimos cuatro digitos de la tarjeta.

## Requisitos

- Node.js 22 o superior.
- pnpm 9 o superior.
- Docker Desktop para PostgreSQL local.
- Credenciales de Wompi Sandbox.

## Configuracion local

1. Instala dependencias:

```bash
pnpm install
```

2. Crea `backend/.env` a partir de `backend/.env.example` y completa las credenciales:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/payment_app?schema=public"
WOMPI_BASE_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=pub_test_xxx
WOMPI_PRIVATE_KEY=prv_test_xxx
WOMPI_INTEGRITY_SECRET=xxx
WOMPI_EVENTS_SECRET=xxx
```

3. Levanta, migra y carga PostgreSQL:

```bash
pnpm setup
```

4. Inicia frontend y backend:

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/docs

Para detener la base de datos:

```bash
pnpm db:down
```

## Pruebas

```bash
pnpm test
pnpm test:coverage
pnpm build
```

La coleccion esta disponible en [docs/postman/payment-app.postman_collection.json](docs/postman/payment-app.postman_collection.json).

## Endpoints principales

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/health` | Estado del servicio |
| GET | `/api/products/featured` | Producto para el checkout |
| GET | `/api/checkout/acceptance-documents` | Enlaces actuales de consentimiento Wompi |
| POST | `/api/checkout/transactions` | Crea y procesa una transaccion |

## Modelo de datos

- `Product`: producto, precio e inventario.
- `Customer`: identificacion y datos de contacto del comprador.
- `Delivery`: direccion y estado de entrega.
- `Transaction`: referencia unica, montos, estado local/Wompi y respuesta de pasarela sin datos sensibles.

La migracion inicial esta en `backend/prisma/migrations`. El seed crea el producto de demostracion.

## Arquitectura backend

- `domain/`: tipos de negocio y resultado funcional.
- `application/`: casos de uso y puertos.
- `infrastructure/`: Prisma, Wompi y controladores HTTP.
- `modules/`: composicion de dependencias NestJS.

Los controladores solo traducen HTTP a casos de uso. La integracion con Wompi implementa el puerto `PaymentGateway`, por lo que puede reemplazarse sin modificar el caso de uso.

## Wompi Sandbox

Esta prueba utiliza las credenciales `stagtest` y la UAT Sandbox `https://api-sandbox.co.uat.wompi.dev/v1` entregadas en el enunciado. Si se usan credenciales nuevas con prefijo `pub_test` y `prv_test`, actualiza `WOMPI_BASE_URL` a la URL correspondiente del dashboard de Wompi.

Usa tarjetas oficiales de prueba de Wompi, por ejemplo `4242 4242 4242 4242` para aprobacion y `4111 1111 1111 1111` para rechazo, con una fecha futura y CVV valido. Nunca incluyas llaves reales en Git ni en la coleccion Postman.

## Despliegue

El despliegue objetivo separa frontend estatico, API NestJS y PostgreSQL administrado. Antes de publicar:

1. Configura secretos de Wompi y `DATABASE_URL` en el proveedor cloud.
2. Ejecuta `pnpm --filter @payment-app/backend prisma:migrate:deploy`.
3. Ejecuta `pnpm --filter @payment-app/backend prisma:seed` una sola vez.
4. Define `WEB_ORIGIN` con el dominio publico del frontend.
5. Configura una URL de eventos de Wompi para conciliacion asincrona.

GitHub Actions ejecuta pruebas y builds para `develop` y `main` en `.github/workflows/ci.yml`.

## Validacion Sandbox realizada

- Pago aprobado: transaccion `APPROVED`, entrega `ASSIGNED` e inventario disminuido.
- Pago rechazado: transaccion `DECLINED`, entrega `CANCELLED` e inventario sin cambios.