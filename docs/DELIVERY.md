# Guia de entrega

## Enlaces

- Aplicacion: https://d1ex8u4v10ds8r.cloudfront.net
- API: https://payment-api-ssia.onrender.com/api/health
- Swagger: https://payment-api-ssia.onrender.com/docs
- Repositorio: https://github.com/luis-tmeza/payment-app

## Recorrido de demostracion

1. Abre la aplicacion y revisa el catalogo.
2. Selecciona Ver detalle para visualizar informacion del producto.
3. Agrega productos al carrito, cambia cantidades con los controles o escribiendo un entero valido y abre el carrito.
4. Presiona Pagar carrito; tambien puedes usar Comprar para una compra directa y definir su cantidad.
5. Completa los datos del comprador y la direccion de entrega.
6. Escribe una tarjeta de prueba de Wompi. Al enfocar el CVC, la tarjeta de vista previa muestra su reverso.
7. Acepta los documentos de Wompi y confirma.
8. Comprueba el resultado, la referencia y el ajuste de inventario.

Usa tarjetas y datos de prueba oficiales de Wompi Sandbox. Nunca uses tarjetas reales.

## Verificaciones realizadas

- Catalogo, detalle, carrito y checkout de multiples lineas.
- Validacion de cantidades enteras entre uno y el inventario disponible.
- Pago aprobado: entrega asignada e inventario confirmado.
- Pago rechazado: entrega cancelada e inventario liberado.
- Proteccion de idempotencia para evitar doble cobro o doble descuento al reintentar.
- Pruebas y compilacion exitosas.
- Endpoint de salud publico con respuesta 200.

## Configuracion externa requerida

En el dashboard de Wompi Sandbox registra el evento:

~~~text
https://payment-api-ssia.onrender.com/api/checkout/wompi/events
~~~

El evento debe usar la llave configurada en WOMPI_EVENTS_SECRET. El backend valida X-Event-Checksum antes de reconciliar una transaccion.

En Render configura WEB_ORIGIN con:

~~~text
https://d1ex8u4v10ds8r.cloudfront.net
~~~

No guardar llaves de Wompi ni DATABASE_URL en GitHub. Los valores se mantienen exclusivamente en las variables de entorno de Render y en archivos .env locales ignorados.

## Operacion

- Render Free puede entrar en reposo; el primer acceso puede tardar alrededor de un minuto.
- El despliegue de Render se activa automaticamente al recibir cambios en la rama configurada.
- Para desplegar el frontend ejecuta scripts/deploy-frontend.ps1; construye la SPA, sincroniza S3 e invalida CloudFront.
- Para validar localmente toda la solucion ejecuta docker compose up --build.