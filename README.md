# Ruta Segura: Misión Urbana

Videojuego web de aventura de decisiones sobre **movilidad segura**, hecho con HTML, CSS y JavaScript (sin librerías).

## Caso seleccionado
**Ruta segura: misión urbana.** Una entidad ficticia quiere comunicar decisiones seguras de movilidad mediante un juego de decisiones.
**Problemática:** ¿Cómo tomar decisiones seguras de movilidad en un entorno urbano caótico?

## Concepto e historia
Kage City sufre una falla en su sistema de movilidad. **Liam**, un mensajero urbano valiente, rápido y decidido, debe atravesar tres distritos para entregar un dispositivo que restablecerá la movilidad segura.
*Un viaje, tres distritos, seis decisiones… y un solo objetivo.*

## Público objetivo
Jóvenes y adolescentes (13–25 años), amantes de los videojuegos, la tecnología y la cultura urbana, y personas interesadas en la movilidad sostenible.

## Mecánicas y reglas
- 3 distritos (niveles): **Shibuya** (hora pico), **Yoru District** (lluvia neón) y **Neo Tokyo Core** (emergencia urbana).
- 2 decisiones por distrito, con 3 opciones cada una (segura, intermedia, de riesgo). Las opciones aparecen en orden aleatorio.
- Cada opción modifica la barra de **Seguridad** y las **fichas** 🪙, y muestra una consecuencia visible (animación del personaje, efecto, texto y sonido).
- Se puede **repetir cualquier distrito** desde el mapa y volver atrás en todo momento (menú ☰ o tecla Esc).
- El progreso se guarda en el navegador.

## Puntuación
| Opción | Seguridad | Fichas |
|---|---|---|
| Segura | +12 | +10 |
| Intermedia | −5 a +3 | +3 a +5 |
| De riesgo | −25 | 0 |

La seguridad inicia en 50 y se limita entre 0 y 100.

## Finales (resultado variable)
- **Seguridad ≥ 80:** Kage City vuelve a moverse.
- **45 a 79:** Entrega con retraso.
- **< 45:** El sistema colapsa.

Cada distrito también da de 1 a 3 estrellas.

## Identidad visual
- **Paleta:** fondo `#0b0b16`, rosa neón `#ff2e93`, cian `#22d3ee`, morado `#a855f7`, amarillo `#fde047`, verde `#4ade80`, rojo `#ff4d4d`, papel `#f1e6cf`.
- **Tipografías:** Permanent Marker (títulos y logotipo), Caveat (notas a mano), Poppins (texto).
- **Estilo:** cyberpunk neón + notas de papel, igual que el póster.

## Estructura de archivos
```
index.html   -> pantallas (inicio, mapa, escena, resultado, final, menú)
style.css    -> identidad visual, temas por distrito, responsive
script.js    -> datos del juego, estado y lógica
assets/      -> liam-hoja.png (hoja de diseño) y recortes liam-frontal/derecha/trasera/izquierda.png
```

## Cómo personalizarlo
- **Textos y decisiones:** edita la constante `NIVELES` al inicio de `script.js`.
- **Personaje:** Liam está en `assets/` (recortes de la hoja de diseño 3D). Para cambiarlo, reemplaza `liam-derecha.png` (escena) y `liam-frontal.png` (inicio y final).
- **Colores:** cambia las variables en `:root` de `style.css`.
- **Finales y umbrales:** constante `FINALES` y la función `mostrarFinal()`.

## Cómo publicarlo (para el QR del póster)
1. Crea un repositorio en GitHub y sube los archivos.
2. En *Settings → Pages* elige la rama `main` y la carpeta raíz.
3. Usa la URL generada para crear el código QR.

## Uso de IA
Se usó IA (Claude) como apoyo para programar y resolver problemas técnicos. El equipo debe entender el código y hacer sus propios ajustes.
