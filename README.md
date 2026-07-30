# Payment App

Monorepo para una prueba tecnica de checkout de pago con integracion a Wompi Sandbox.

## Stack elegido

- Frontend: Vue 3, TypeScript, Vite, Vuex 4, Vue Router, Vitest.
- Backend: NestJS, TypeScript, Jest, Prisma, PostgreSQL.
- Arquitectura backend: hexagonal con casos de uso, puertos y adaptadores.
- Estado de checkout: Vuex con persistencia local para recuperar avance despues de refresh.

## Estructura

```text
./
  backend/   NestJS API
  frontend/  Vue 3 SPA
```

## Flujo funcional requerido

1. Pagina de producto con descripcion, precio y unidades disponibles.
2. Modal para tarjeta de credito y datos de entrega.
3. Resumen con monto del producto, tarifa base y envio.
4. Creacion de transaccion PENDING en backend y pago contra Wompi Sandbox.
5. Resultado final, asignacion de entrega y actualizacion de stock.

## Modelo de datos inicial

- products: producto, descripcion, precio y stock.
- customers: informacion del comprador.
- deliveries: direccion y estado de entrega.
- transactions: referencia interna, estado, montos, informacion no sensible y respuesta de pasarela.

## Comandos

```bash
pnpm install
pnpm dev
pnpm test:coverage
```

## Variables de entorno

Ver [backend/.env.example](backend/.env.example) y [frontend/.env.example](frontend/.env.example).

Las llaves privadas de Wompi no deben versionarse. Copia los valores reales solo en `.env` local o en secretos del proveedor cloud.

## Plan de implementacion y commits

1. `chore`: base del monorepo y convenciones de desarrollo. Completado.
2. `feat(frontend)`: Vuex, persistencia del checkout y base SPA. En curso.
3. `feat(backend)`: consulta de producto mediante caso de uso, puerto Prisma y Swagger.
4. `feat(frontend)`: producto conectado al API, carga, error y estado sin inventario.
5. `feat(checkout)`: formulario modal de tarjeta y entrega, validaciones y deteccion de franquicia.
6. `feat(transactions)`: creacion PENDING, cliente Wompi Sandbox y finalizacion atomica de pago, entrega e inventario.
7. `feat(frontend)`: resumen, resultado de transaccion y recuperacion de estado.
8. `test`: pruebas unitarias y cobertura superior al 80% en ambos proyectos.
9. `docs`: Swagger, modelo de datos, configuracion local y despliegue.

Cada punto se confirmara en un commit funcional, verificable y sin incluir secretos.


