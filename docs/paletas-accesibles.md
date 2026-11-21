# Gremlib: revisión de las paletas de accesibilidad

## Problema y alcance

La revisión de `main` (13700ed) detectó que los estados «Crítico» y «Bajo» compartían colores muy próximos en los modos adaptados. En protanopia y deuteranopia ambos se percibían como tonos oscuros de amarillo/marrón; en tritanopia ambos procedían de rojos de luminosidad parecida. Cambiar el nombre del modo o aplicar un tinte global no resolvía esa ambigüedad.

Este cambio conserva la distribución, fondo crema, tipografía y mascota de Gremlib. Revisa los colores semánticos de la interfaz clara, añade redundancia visual al stock y refuerza el estado activo del menú. Las preferencias siguen aplicándose desde el proveedor raíz y se guardan con las mismas claves. No cambia compras, permisos ni datos del catálogo.

## Criterios de diseño

El National Eye Institute distingue las dificultades rojo-verde de la protanopia y deuteranopia de las confusiones azul-verde, morado-rojo y amarillo-rosa de la tritanopia. Esto orienta el diseño, pero no establece una paleta universal válida para todas las personas [1]. Las paletas siguientes son decisiones del proyecto evaluadas mediante contraste y simulación, no una prescripción de esas fuentes.

Se prioriza que los colores nunca sean la única forma de comunicar información (WCAG 1.4.1) [2]. Para los pares de texto comprobados se exige 4,5:1; para indicadores gráficos y límites de campos comprobados, 3:1 frente a su fondo [3, 4]. El contraste entre dos colores de categorías separadas no equivale al contraste de un texto contra su fondo, ni garantiza por sí solo su diferenciación perceptiva.

## Paletas seleccionadas

Los HEX son equivalentes sRGB redondeados; la aplicación define los colores en OKLCH.

| Modo | Crítico (0–5) | Bajo (6–10) | Normal (>10) | Justificación |
| --- | --- | --- | --- | --- |
| Sin adaptación | Rojo oscuro `#A51F35` | Ocre `#A96800` | Verde `#28613C` | Mantiene la asociación habitual y oscurece indicadores sobre blanco. |
| Protanopia | Carbón `#25252B` | Ocre `#A96800` | Azul `#0069A8` | Se evita que la clasificación dependa de distinguir rojo y verde; el carbón separa el estado crítico del ocre. |
| Deuteranopia | Carbón `#25252B` | Ocre `#A96800` | Azul `#0069A8` | Se comparte la base, comprobada por separado con esta simulación. No es necesario inventar colores distintos para cada nombre de modo. |
| Tritanopia | Granate `#841445` | Gris `#727272` | Verde azulado `#006963` | Evita enfrentar azul con verde o amarillo con rosa; combina un eje rojizo/verde azulado con un tercer estado neutro. |

En todos los modos:

- Crítico: octágono con exclamación, etiqueta y unidades.
- Bajo: triángulo con exclamación, etiqueta y unidades.
- Normal: círculo con marca de comprobación, etiqueta y unidades.
- Se muestran los límites de los estados para evitar dudas sobre las unidades 5 y 10.
- Los iconos son decorativos para el lector de pantalla porque la etiqueta ya comunica el estado.

Los botones, enlaces, estrellas de reseñas, opciones de inicio, mensajes y menú usan las variables globales. Los estados de stock tienen variables propias, independientes del acento decorativo y del color de error. El menú activo incorpora una línea inferior y mayor peso tipográfico. Los campos y textos secundarios ganan contraste. El selector explica que se cambia la paleta de la interfaz y que puede combinarse con alto contraste.

Las portadas y la mascota conservan sus colores originales: no se aplica un filtro a fotografías o ilustraciones. El género y la identidad de los libros se expresan también con texto. Esta revisión no constituye una auditoría de todos los píxeles de imágenes o degradados, ni del tema oscuro de los componentes base, que no se ofrece como ajuste de la aplicación.

## Comprobación reproducible

```sh
node scripts/audit-palettes.mjs
npm test
npx tsc --noEmit
npm run build
```

El primer comando lee los tokens de `src/styles.css`, resuelve los modos y alto contraste, calcula luminancia relativa y regenera `palette-audit.json` y `paletas-stock.svg`. Verifica 24 pares en cuatro modos y dos configuraciones de contraste: **192 comprobaciones**. No inspecciona todas las combinaciones posibles de estados hover, transparencia o imágenes.

| Modo | Contraste del indicador crítico/blanco | Bajo/blanco | Normal/blanco |
| --- | ---: | ---: | ---: |
| Sin adaptación | 7,38:1 | 4,50:1 | 7,33:1 |
| Protanopia | 15,24:1 | 4,50:1 | 5,86:1 |
| Deuteranopia | 15,24:1 | 4,50:1 | 5,86:1 |
| Tritanopia | 9,69:1 | 4,81:1 | 6,56:1 |

Son indicadores gráficos, cuyo umbral utilizado es 3:1; el texto de las etiquetas conserva el color de texto principal. La evaluación usa valores sin redondear, aunque la tabla los muestra con dos decimales.

La simulación usa las matrices publicadas de Machado, Oliveira y Fernandes (2009), severidad 1, sobre RGB **lineal**, seguida de recorte al gamut sRGB y codificación de salida [5, 6]. Se calcula distancia euclídea OKLab entre muestras simuladas para detectar regresiones. Se usa 0,08 como umbral interno de alarma: **no es un umbral de WCAG ni una garantía clínica de diferenciación**.

| Simulación | Distancia Crítico–Bajo anterior | Distancia nueva |
| --- | ---: | ---: |
| Protanopia | 0,071 | 0,294 |
| Deuteranopia | 0,060 | 0,345 |
| Tritanopia | 0,015 | 0,215 |

Para reproducir la comparación con la versión previa:

```sh
git show 13700ed:src/styles.css > /tmp/gremlib-before.css
node scripts/audit-palettes.mjs /tmp/gremlib-before.css
```

La lámina [paletas-stock.svg](paletas-stock.svg) contiene muestras calculadas, no imágenes generadas por IA ni capturas de la aplicación. Para la memoria, comparar la interfaz original bajo una simulación concreta con la interfaz adaptada **bajo la misma simulación**. Una captura del modo adaptado sin simular no representa cómo lo percibe esa persona.

### Resultados y límites

- Pasan las 192 comprobaciones de tokens y las comprobaciones internas de separación de las muestras simuladas.
- Pasan la compilación, TypeScript y las pruebas automatizadas, incluidas las etiquetas y formas de stock en los límites 0, 5, 6, 10 y 11.
- No se ha podido completar la comprobación visual en navegador en este entorno: Chromium no pudo iniciarse por una restricción de sockets. No se atribuyen resultados de navegación ni capturas reales a esta revisión.
- Queda la revisión visual en móvil y la evaluación con personas con estas características visuales. No se declara conformidad WCAG completa ni que el ajuste «corrija» la visión.

### Guion breve para revisar la rama

1. En Accesibilidad, seleccionar cada modo y observar gestión de stock, catálogo, ficha, cesta y mensajes de error.
2. Identificar Crítico, Bajo y Normal por texto y forma, también en escala de grises.
3. Combinar cada modo con alto contraste y texto ampliado; comprobar el panel y su desplegable, que aparecen en portales.
4. Recargar para confirmar que se mantienen las preferencias; comprobar navegación con Tab y que el foco sea visible.
5. A 360 px de ancho, comprobar que no aparece desplazamiento horizontal ni se corta información de los libros. Confirmar las simulaciones con capturas reales, sin confundir adaptación con simulación.

## Referencias

1. National Eye Institute. (2023, 7 de agosto). *Types of color vision deficiency*. https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness/types-color-vision-deficiency
2. World Wide Web Consortium. (s. f.). *Understanding Success Criterion 1.4.1: Use of Color*. https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
3. World Wide Web Consortium. (s. f.). *Understanding Success Criterion 1.4.3: Contrast (Minimum)*. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
4. World Wide Web Consortium. (s. f.). *Understanding Success Criterion 1.4.11: Non-text Contrast*. https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
5. Machado, G. M., Oliveira, M. M., & Fernandes, L. A. F. (2009). A physiologically-based model for simulation of color vision deficiency. *IEEE Transactions on Visualization and Computer Graphics, 15*(6), 1291–1298. https://doi.org/10.1109/TVCG.2009.113 — Matrices de los autores: https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
6. Colorspace. (s. f.). *Color Vision Deficiency Emulation*. https://colorspace.r-forge.r-project.org/articles/color_vision_deficiency.html
