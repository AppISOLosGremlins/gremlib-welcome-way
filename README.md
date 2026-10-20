# 📚 GremLib - Aplicación Móvil

Proyecto universitario desarrollado con React, Vite, Tailwind CSS y Supabase (mediante Lovable).

---

## 🚀 Acceso a la Aplicación Desplegada

Puedes probar la aplicación directamente en la nube sin necesidad de instalar nada localmente:

* 🌐 **Enlace directo:** [https://gremlib-prototipo.netlify.app](https://gremlib-prototipo.netlify.app)

### Acceso para evaluación

Solicita al grupo las credenciales de la cuenta de prueba por un canal privado.

---

## 📱 Recomendación de Visualización (Modo Móvil)

Al tratarse del diseño de una **aplicación móvil**, se recomienda simular la pantalla de un teléfono desde el navegador del ordenador:

1. Abre el enlace de la aplicación en Chrome, Edge o Firefox.
2. Abre las herramientas de desarrollo pulsando **F12** (o clic derecho > *Inspeccionar*).
3. Activa la vista adaptativa pulsando **`Ctrl + Shift + M`** en Windows/Linux o **`Cmd + Shift + M`** en Mac.
4. Selecciona un dispositivo en el menú desplegable superior (por ejemplo, *iPhone 14* o *Pixel 7*).

---

## 🛠️ Ejecución en Local (Opcional)

No disponible

---

## 👥 Autores del Proyecto
[Antonio Miguel Hernández Inocencio] - [antoniomiguel.hernandez1@alu.uclm.es]

[Raúl García Garrido] - [raul.garcia40@alu.uclm.es]

[Ángel Galiano Sáez] - [angel.galiano1@alu.uclm.es]

## Prototipo de compra

- Añade libros desde el catálogo o su ficha y elige entre ir a la cesta o seguir comprando.
- En Cesta puedes cambiar cantidades, eliminar libros y abrir sus fichas.
- Completa los datos de entrega y acepta la confirmación simulada. No se solicitan datos bancarios.
- El pedido queda como **Realizado**, se vacía la cesta y el historial se consulta desde **Perfil → Mis pedidos**.

Esta versión guarda la cesta y los pedidos en el almacenamiento local del navegador, separados por el identificador de la cuenta. Se conservan al recargar y al volver a iniciar sesión en el mismo navegador y origen. No se sincronizan entre dispositivos, localhost y Lovable. Borrar los datos del sitio elimina este historial. Usa datos de entrega de prueba para la demostración.

La confirmación comprueba los precios y existencias actuales del catálogo, pero no reserva ni descuenta stock, no realiza cargos y no genera envíos reales. No necesita migraciones de base de datos. La persistencia en servidor y la aprobación por un empleado quedan para una fase posterior.

Comprobaciones de compra: `npm test -- src/test/shop.test.ts src/test/shop-provider.test.tsx`. Compilación: `npm run build`. Tipos: `npx tsc --noEmit`.
