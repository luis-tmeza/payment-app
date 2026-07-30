# Payment App

Monorepo para una prueba tecnica de checkout de pago con integracion a Wompi Sandbox.

## Stack elegido

- Frontend: Vue 3, TypeScript, Vite, Pinia, Vue Router, Vitest.
- Backend: NestJS, TypeScript, Jest, Prisma, PostgreSQL.
- Arquitectura backend: hexagonal con casos de uso, puertos y adaptadores.
- Estado de checkout: Pinia con persistencia local para recuperar avance despues de refresh.

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

## Pendiente por completar

- Documentar Swagger/Postman.
- Agregar resultados reales de cobertura.
- Agregar instrucciones de despliegue cloud.


