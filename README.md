# Gremlib Welcome Way

Creame una interfaz de una app movil de una libreria llamada GremLib, te he pasado foto de como seria el banner de la app. Para empezar creame el portal de introduccion

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e691638c-347a-452e-af86-4fba83c57a20).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Prototipo de compra

- Añade libros desde el catálogo o su ficha y elige entre ir a la cesta o seguir comprando.
- En Cesta puedes cambiar cantidades, eliminar libros y abrir sus fichas.
- Completa los datos de entrega y acepta la confirmación simulada. No se solicitan datos bancarios.
- El pedido queda como **Realizado**, se vacía la cesta y el historial se consulta desde **Perfil → Mis pedidos**.

Esta versión guarda la cesta y los pedidos en el almacenamiento local del navegador, separados por el identificador de la cuenta. Se conservan al recargar y al volver a iniciar sesión en el mismo navegador y origen. No se sincronizan entre dispositivos, localhost y Lovable. Borrar los datos del sitio elimina este historial. Usa datos de entrega de prueba para la demostración.

La confirmación comprueba los precios y existencias actuales del catálogo, pero no reserva ni descuenta stock, no realiza cargos y no genera envíos reales. No necesita migraciones de base de datos. La persistencia en servidor y la aprobación por un empleado quedan para una fase posterior.

Comprobaciones de compra: `npm test -- src/test/shop.test.ts src/test/shop-provider.test.tsx`. Compilación: `npm run build`. Tipos: `npx tsc --noEmit`.
