# Apariencia oscura y revisión del feedback

## Cambios de esta rama

- **Modo oscuro**: interruptor independiente en Accesibilidad. Se conserva en la misma configuración local que las demás preferencias. Las configuraciones anteriores sin este campo siguen funcionando y usan inicialmente apariencia clara. Restablecer ajustes recupera la apariencia clara.
- Se aplica la apariencia guardada desde la cabecera antes de la hidratación para evitar el destello claro en visitas posteriores. La configuración del servidor no depende del almacenamiento del navegador.
- Colores semánticos para fondo, tarjetas, formularios, botones, navegación, reseñas, mensajes, diálogos y desplegables. Se incluyen variantes oscuras para las tres adaptaciones cromáticas y alto contraste. Se mantienen tipografías, estructura, imágenes y controles de tamaño de texto.
- Las ilustraciones dejan de usar mezcla multiplicativa sobre fondos oscuros para evitar que la mascota se oscurezca. La portada predeterminada conserva un fondo oscuro para su texto blanco.
- **Stock del menú**: enlace nativo directo a `/reponer`, con el mismo estilo y marca de página activa. Hace navegación completa y conserva la comprobación de permisos de la ruta. El código anterior ya declaraba el destino correcto, por lo que no se atribuye el fallo observado a una causa no reproducida. Este enlace elimina la dependencia de la interceptación de navegación del router para ese acceso concreto.
- **Google**: se oculta el botón y el separador, y se retira su manejador no utilizado de la pantalla. Se conserva el módulo de integración para una futura revisión. No se ha modificado el proveedor OAuth ni se afirma haber reparado su configuración externa.

## Lectura al tocar: qué hace realmente

Revisión de `accessibility-provider.tsx` y `accessibility.ts` y pruebas con la API de voz simulada:

- Comprueba la presencia de `speechSynthesis` y `SpeechSynthesisUtterance`.
- Al hacer clic o tocar un elemento admitido, cancela la locución anterior y solicita leer su texto o nombre accesible. Configura español de España y velocidad 0,95.
- Los botones con nombre accesible usan ese nombre. No lee valores de inputs, contraseñas ni áreas de texto. El panel de accesibilidad está excluido de esta lectura.
- Desactivar la opción retira el manejador y cancela la lectura. Existe un control para detenerla y un mensaje para errores de síntesis.

**No es un lector de pantalla completo y no narra automáticamente el resultado de cada acción.** Por ejemplo, puede leer «Añadir libro», pero no se ha implementado una locución automática de «Libro añadido». Los mensajes con `role="status"` o `role="alert"` son otra vía de accesibilidad, interpretada por lectores de pantalla compatibles; eso no equivale a una llamada a esta síntesis de voz.

Limitaciones observadas, sin modificar este comportamiento en esta rama:

- Un toque cuyo objetivo sea un SVG con `aria-hidden="true"` se descarta antes de buscar el botón padre. El efecto real depende de si el CSS deja que el icono reciba eventos; los botones compartidos suelen desactivar esos eventos.
- Se leen solo los elementos incluidos en el selector, no cualquier contenido de la página ni el foco de teclado automáticamente.
- El panel no comprueba que haya una voz española instalada. La disponibilidad real y el audio dependen del navegador y del sistema.
- No se ha realizado una escucha física en un dispositivo; las pruebas comprueban las solicitudes a la API.

## Vibración: qué hace realmente

Revisión de `sounds.ts` y de sus llamadas:

| Acción | Solicitud de vibración (milisegundos; alterna vibración/pausa) |
| --- | --- |
| Añadir libro | 40 |
| Quitar libro | 30, 40, 30 |
| Publicar reseña | 60 |
| Confirmar pedido | 60, 50, 80, 50, 120 |
| Errores que llaman a `playSound("error")` | 100, 60, 100, 60, 100 |

La opción de vibración es independiente de la de sonido: se puede vibrar con los sonidos apagados. Desactivarla evita nuevas solicitudes. Si la API no existe o lanza un error, la acción principal continúa.

**No vibra al tocar cualquier elemento ni en todas las operaciones.** La reposición de stock no llama actualmente a esta función. Los errores de autenticación y de publicación de reseñas sí la llaman; no todos los errores de la aplicación lo hacen.

La API tiene disponibilidad limitada y requiere interacción previa del usuario. La existencia de `navigator.vibrate` o un retorno `true` no garantiza que haya vibración física: influyen el hardware, el navegador, las preferencias del dispositivo y restricciones como los iframes. El código actual no informa de una solicitud rechazada y mantiene visible el ajuste aunque no exista la API. Además, si leer las preferencias del almacenamiento falla, la función termina sin emitir feedback.

No se han modificado las funciones de voz ni vibración: el usuario pidió comprobarlas antes de decidir nuevos cambios.

## Validación

- `npm test`: 44 pruebas pasan, incluidas persistencia y combinación de apariencia, compatibilidad de preferencias antiguas, lectura con API simulada y vibración con API simulada.
- `npx tsc --noEmit`: correcto.
- `node scripts/audit-palettes.mjs`: 384 comprobaciones de contraste de tokens y separación orientativa de colores simulados. No equivale a una auditoría WCAG completa de todos los componentes/estados.
- `npm run build`: compilación de producción correcta.
- La comprobación visual interactiva en navegador y la sensación física de voz/vibración quedan pendientes. No se confunden pruebas con mocks con pruebas realizadas en móviles.

Antes de integrar, revisar Inicio, acceso, catálogo, ficha, cesta, perfil, stock y el panel de accesibilidad. Combinar apariencia oscura con cada paleta, alto contraste y texto ampliado; comprobar foco y ausencia de recortes a 360 px. Recargar y restablecer para comprobar la conservación de preferencias. En administrador, pulsar Stock desde otra pantalla y verificar que abre Gestión de stock. Comprobar que un cliente continúa sin acceso a la gestión.

## Ubicación en la memoria

El modo oscuro pertenece al **reto 2 (personalización)**: elección de apariencia, ajustes independientes y conservación de preferencias. No se debe describir como una mejora universal para todas las personas; es una alternativa seleccionable.

El **reto 3 (feedback)** debe distinguir mensajes visuales, sonidos, vibración y lectura al tocar. La última es una ayuda para consultar contenido, no confirmación hablada automática de operaciones. Describir solo las acciones conectadas y las limitaciones de compatibilidad, sin afirmar que todos los dispositivos vibran.

Para las figuras de daltonismo, conservar como referencia la herramienta indicada por el grupo: https://www.colorblindnesstest.org/es/herramientas-de-color/simulador-de-daltonismo/ . Atribuirle únicamente las capturas procesadas realmente con ella; la auditoría numérica del repositorio utiliza matrices de Machado.

## Fuentes técnicas consultadas

- MDN. *SpeechSynthesis: speak()*. https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak
- MDN. *Vibration API*. https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
- MDN. *Navigator: vibrate()*. https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
- W3C. *Vibration API — Implementation Report*. https://w3c.github.io/vibration/reports/implementation.html
