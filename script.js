/* =========================================================
   RUTA SEGURA: MISIÓN URBANA  ·  Lógica del juego
   ---------------------------------------------------------
   Estructura del archivo:
   1. DATOS         -> distritos, decisiones, opciones y finales
   2. ESTADO        -> lo que el juego "recuerda"
   3. UTILIDADES    -> funciones pequeñas de apoyo
   4. PANTALLAS     -> mostrar/ocultar secciones
   5. FLUJO         -> iniciar nivel, elegir, siguiente, finalizar
   6. FINAL         -> cálculo del final según la seguridad
   7. MENÚ, SONIDO Y GUARDADO
   8. EVENTOS       -> conexión de los botones
   ========================================================= */
'use strict';

/* ---------------------------------------------------------
   1. DATOS
   Cada opción tiene:
     tipo:  'bueno' | 'regular' | 'malo'
     seg:   cambio en la barra de seguridad
     fichas: monedas que gana
     consecuencia: texto que ve el jugador
   Para agregar o cambiar decisiones, solo edita esta lista.
   --------------------------------------------------------- */
const SEGURIDAD_INICIAL = 50;
const DECISIONES_POR_NIVEL = 2;

const NIVELES = [
  {
    id: 'shibuya',
    tema: 'tema-shibuya',
    nombre: 'Shibuya',
    condicion: 'Hora pico',
    emoji: '🌆',
    resumen: 'Multitudes, semáforos y mucha prisa.',
    decisiones: [
      {
        icono: '🚦',
        titulo: 'El gran cruce',
        situacion: 'Llegas al cruce más concurrido de Shibuya. El semáforo peatonal está en rojo, pero no hay carros a la vista y tu entrega corre prisa.',
        opciones: [
          { texto: 'Esperar al cruce (semáforo en verde)', tipo: 'bueno', seg: 12, fichas: 10,
            consecuencia: 'Esperas unos segundos y cruzas con la multitud cuando el semáforo cambia. Un taxi pasa a toda velocidad justo donde ibas a pisar.' },
          { texto: 'Cruzar ahora, antes de que cambie', tipo: 'malo', seg: -25, fichas: 0,
            consecuencia: 'Una moto aparece entre dos buses y frena a centímetros de ti. Te asustas, tropiezas y pierdes el equilibrio del paquete.' },
          { texto: 'Buscar el puente peatonal más cercano', tipo: 'regular', seg: 3, fichas: 5,
            consecuencia: 'Das una vuelta larga pero cruzas sin riesgo. Pierdes tiempo, aunque llegas completo a la otra acera.' }
        ]
      },
      {
        icono: '🚌',
        titulo: 'Bus en la acera',
        situacion: 'Un bus bloquea el paso peatonal. A tu izquierda hay un hueco entre los carros detenidos y, a la derecha, una ciclorruta señalizada.',
        opciones: [
          { texto: 'Usar la ciclorruta señalizada y avanzar con calma', tipo: 'bueno', seg: 12, fichas: 10,
            consecuencia: 'Avanzas por el carril protegido, los conductores te ven y te dan espacio. Cero sobresaltos.' },
          { texto: 'Colarte entre los carros detenidos', tipo: 'malo', seg: -25, fichas: 0,
            consecuencia: 'El semáforo cambia y los carros arrancan de golpe. Quedas atrapado entre dos parachoques y un conductor te pita furioso.' },
          { texto: 'Esperar a que el bus se mueva', tipo: 'regular', seg: 2, fichas: 5,
            consecuencia: 'Esperas varios minutos. Es seguro, pero la ciudad no puede esperar mucho y tu tiempo se agota.' }
        ]
      }
    ]
  },
  {
    id: 'yoru',
    tema: 'tema-yoru',
    nombre: 'Yoru District',
    condicion: 'Lluvia neón',
    emoji: '🌧️',
    resumen: 'Calles mojadas y poca visibilidad.',
    decisiones: [
      {
        icono: '🌧️',
        titulo: 'Calles resbalosas',
        situacion: 'La lluvia ha mojado el asfalto y los reflejos de neón te encandilan. Estás en una avenida larga y puedes ganar tiempo si aceleras.',
        opciones: [
          { texto: 'Reducir la velocidad y encender tus luces', tipo: 'bueno', seg: 12, fichas: 10,
            consecuencia: 'Con luces y marcha tranquila, los demás te ven desde lejos. Frenas a tiempo ante un charco enorme.' },
          { texto: 'Mantener la velocidad para recuperar tiempo', tipo: 'malo', seg: -25, fichas: 0,
            consecuencia: 'Al frenar en la curva patinas sobre el asfalto mojado. Te salvas por poco, pero pierdes fichas en la caída.' },
          { texto: 'Detenerte bajo un techo hasta que pare la lluvia', tipo: 'regular', seg: 0, fichas: 3,
            consecuencia: 'Estás a salvo, pero la lluvia no para y el reloj sigue corriendo. Tendrás que arriesgarte más adelante.' }
        ]
      },
      {
        icono: '🚕',
        titulo: 'Conductor distraído',
        situacion: 'Llegas a una esquina sin semáforo. Un taxi se acerca y el conductor mira su celular en lugar de la vía.',
        opciones: [
          { texto: 'Hacer contacto visual y esperar a que frene del todo', tipo: 'bueno', seg: 12, fichas: 10,
            consecuencia: 'El conductor levanta la vista, frena de golpe y te hace seña. Cruzas con seguridad.' },
          { texto: 'Cruzar confiado: tienes prioridad', tipo: 'malo', seg: -25, fichas: 0,
            consecuencia: 'El taxi no frenó. Tener prioridad no sirve si el otro no te ve; esquivas el golpe por un salto de último segundo.' },
          { texto: 'Tomar el callejón oscuro para evitar la esquina', tipo: 'regular', seg: -5, fichas: 5,
            consecuencia: 'Evitas el taxi, pero el callejón no tiene luz y casi tropiezas con unas cajas. Esquivaste un riesgo y encontraste otro.' }
        ]
      }
    ]
  },
  {
    id: 'neo',
    tema: 'tema-neo',
    nombre: 'Neo Tokyo Core',
    condicion: 'Emergencia urbana',
    emoji: '🚨',
    resumen: 'Sirenas, caos y semáforos caídos.',
    decisiones: [
      {
        icono: '🚑',
        titulo: 'Sirenas a tu espalda',
        situacion: 'Una ambulancia con sirena se acerca por detrás. Estás en una calle estrecha y tienes poco espacio para moverte.',
        opciones: [
          { texto: 'Orillarte y ceder el paso', tipo: 'bueno', seg: 12, fichas: 10,
            consecuencia: 'Te pegas a la derecha y la ambulancia pasa sin frenar. Alguien en la acera te hace una señal de agradecimiento.' },
          { texto: 'Acelerar para adelantarla y salir de ahí', tipo: 'malo', seg: -25, fichas: 0,
            consecuencia: 'Bloqueas el carril y la ambulancia debe frenar en seco. Pierdes tiempo, pones en riesgo a otros y un agente te llama la atención.' },
          { texto: 'Detenerte en medio de la calle', tipo: 'regular', seg: -5, fichas: 3,
            consecuencia: 'Te quedas quieto sin saber qué hacer. La ambulancia debe esquivarte, pero afortunadamente logra pasar.' }
        ]
      },
      {
        icono: '🚨',
        titulo: 'Semáforos caídos',
        situacion: 'Una falla apagó todos los semáforos del cruce final. Los carros avanzan sin orden y un agente de tránsito intenta organizar el paso.',
        opciones: [
          { texto: 'Seguir las indicaciones del agente de tránsito', tipo: 'bueno', seg: 12, fichas: 10,
            consecuencia: 'El agente te da paso en el momento justo. Llegas a la torre central con el dispositivo intacto.' },
          { texto: 'Pasar rápido antes de que se cierre el hueco', tipo: 'malo', seg: -25, fichas: 0,
            consecuencia: 'Un auto aparece de un costado y casi te arrolla. El agente te detiene y llegas con el paquete dañado y el pulso a mil.' },
          { texto: 'Tomar una ruta alterna más larga', tipo: 'regular', seg: 3, fichas: 5,
            consecuencia: 'Esquivas el caos dando un rodeo. No corres riesgos, pero llegas con la energía justa.' }
        ]
      }
    ]
  }
];

/* Finales posibles (según la seguridad total al terminar) */
const FINALES = {
  bueno: {
    emoji: '🏙️', titulo: 'Kage City vuelve a moverse',
    texto: 'Entregaste el dispositivo a tiempo y el sistema de movilidad se reinició. Semáforos, buses y peatones vuelven a coordinarse. Tus decisiones seguras inspiraron a otros a cuidarse en la calle.',
    mensaje: 'Cada decisión cuenta. ¡Tú la hiciste contar!'
  },
  regular: {
    emoji: '🌃', titulo: 'Entrega con retraso',
    texto: 'Lograste entregar el dispositivo, pero algunas decisiones arriesgadas te costaron tiempo y sustos. El sistema se restablece poco a poco, con algunos tramos todavía caóticos.',
    mensaje: 'Casi perfecto. Repite un distrito para mejorar tu ruta.'
  },
  malo: {
    emoji: '🚧', titulo: 'El sistema colapsa',
    texto: 'Las decisiones imprudentes te dejaron sin energía y el dispositivo llegó dañado. La ciudad sigue en caos y la movilidad no se restablece.',
    mensaje: 'Un mal camino puede cambiar. Vuelve a intentarlo.'
  }
};

/* ---------------------------------------------------------
   2. ESTADO
   --------------------------------------------------------- */
const estado = {
  nivel: null,            // índice del nivel actual (0, 1, 2)
  paso: 0,                // decisión actual dentro del nivel (0 o 1)
  actual: null,           // resultados parciales del nivel en curso
  resultados: [null, null, null], // resultado guardado de cada nivel ya jugado
  desbloqueado: 0,        // índice del último nivel disponible
  enJuego: false,         // true mientras se está en una escena
  sonido: true
};

function nuevoActual() {
  return { seg: 0, fichas: 0, elecciones: [] };
}

/* Seguridad total = inicial + resultados de los otros niveles + nivel actual */
function calcularSeguridad() {
  let total = SEGURIDAD_INICIAL;
  estado.resultados.forEach(function (r, i) {
    if (r && !(estado.actual && i === estado.nivel)) total += r.seg;
  });
  if (estado.actual) total += estado.actual.seg;
  return Math.max(0, Math.min(100, total));
}

function calcularFichas() {
  let total = 0;
  estado.resultados.forEach(function (r, i) {
    if (r && !(estado.actual && i === estado.nivel)) total += r.fichas;
  });
  if (estado.actual) total += estado.actual.fichas;
  return total;
}

/* ---------------------------------------------------------
   3. UTILIDADES
   --------------------------------------------------------- */
const $ = function (id) { return document.getElementById(id); };

function mezclar(lista) {            // Fisher-Yates: baraja las opciones
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function signo(n) { return (n > 0 ? '+' : '') + n; }

function estrellasDe(seg) {
  if (seg >= 20) return 3;
  if (seg >= 5) return 2;
  return 1;
}

function textoEstrellas(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }

/* ---------------------------------------------------------
   4. PANTALLAS
   --------------------------------------------------------- */
function mostrarPantalla(id) {
  document.querySelectorAll('.pantalla').forEach(function (p) { p.classList.remove('activa'); });
  $(id).classList.add('activa');
  const conHud = (id === 'pantalla-escena' || id === 'pantalla-mapa' || id === 'pantalla-resultado' || id === 'pantalla-final');
  $('hud').classList.toggle('oculto', !conHud);
  estado.enJuego = (id === 'pantalla-escena');
  window.scrollTo(0, 0);
  actualizarHud();
}

function actualizarHud() {
  const seg = calcularSeguridad();
  const barra = $('barra-seguridad');
  barra.style.width = seg + '%';
  barra.style.background = seg >= 70 ? 'var(--verde)' : seg >= 40 ? 'var(--amarillo)' : 'var(--rojo)';
  $('valor-seguridad').textContent = seg;
  $('valor-fichas').textContent = calcularFichas();
  $('hud-distrito').textContent = estado.nivel === null ? 'Kage City' : NIVELES[estado.nivel].nombre;
}

/* ---------- Mapa de niveles ---------- */
function dibujarMapa() {
  const cont = $('mapa-niveles');
  cont.innerHTML = '';
  NIVELES.forEach(function (n, i) {
    const bloqueado = i > estado.desbloqueado;
    const res = estado.resultados[i];
    const btn = document.createElement('button');
    btn.className = 'nodo';
    btn.disabled = bloqueado;
    btn.innerHTML =
      '<div class="nodo-numero">' + (i + 1) + '</div>' +
      '<h3>' + n.emoji + ' ' + n.nombre + '</h3>' +
      '<p><strong>' + n.condicion + '</strong></p>' +
      '<p>' + n.resumen + '</p>' +
      (bloqueado ? '<p>🔒 Bloqueado</p>' :
        res ? '<div class="estrellas">' + textoEstrellas(estrellasDe(res.seg)) + '</div><p>Toca para repetir</p>' :
              '<p>▶ Toca para jugar</p>');
    btn.addEventListener('click', function () { iniciarNivel(i); });
    cont.appendChild(btn);
  });
  const todos = estado.resultados.every(function (r) { return r !== null; });
  $('btn-ver-final').classList.toggle('oculto', !todos);
}

function irAlMapa() {
  estado.nivel = null;
  estado.actual = null;
  dibujarMapa();
  mostrarPantalla('pantalla-mapa');
}

/* ---------------------------------------------------------
   5. FLUJO DEL JUEGO
   --------------------------------------------------------- */
function iniciarNivel(n) {
  estado.nivel = n;
  estado.paso = 0;
  estado.actual = nuevoActual();
  const nivel = NIVELES[n];

  // Decoración según el distrito
  const visual = $('escena-visual');
  visual.className = 'escena-visual ' + nivel.tema;
  crearCiudad(n);
  crearLluvia();

  mostrarPantalla('pantalla-escena');
  mostrarDecision();
}

function mostrarDecision() {
  const nivel = NIVELES[estado.nivel];
  const dec = nivel.decisiones[estado.paso];

  $('escena-etiqueta').textContent = nivel.nombre + ' · ' + nivel.condicion;
  $('escena-contador').textContent = 'Decisión ' + (estado.paso + 1) + ' de ' + DECISIONES_POR_NIVEL;
  $('escena-titulo').textContent = dec.titulo;
  $('escena-texto').textContent = dec.situacion;
  $('situacion-icono').textContent = dec.icono;

  // Reiniciar al personaje
  const p = $('personaje');
  p.classList.remove('bueno', 'regular', 'malo');

  // Dibujar opciones (en orden aleatorio para que no siempre esté primero la correcta)
  const cont = $('opciones');
  cont.innerHTML = '';
  mezclar(dec.opciones).forEach(function (op) {
    const b = document.createElement('button');
    b.className = 'opcion';
    b.textContent = op.texto;
    b.addEventListener('click', function () { elegir(op, b); });
    cont.appendChild(b);
  });

  $('consecuencia').classList.add('oculto');
  $('consecuencia').className = 'consecuencia oculto';
  actualizarHud();
}

function elegir(op, boton) {
  // Bloquear las demás opciones
  document.querySelectorAll('.opcion').forEach(function (b) { b.disabled = true; });
  boton.classList.add('elegida', op.tipo);

  // Guardar el efecto de la decisión
  estado.actual.seg += op.seg;
  estado.actual.fichas += op.fichas;
  const dec = NIVELES[estado.nivel].decisiones[estado.paso];
  estado.actual.elecciones.push({ titulo: dec.titulo, texto: op.texto, tipo: op.tipo, seg: op.seg });

  // Consecuencia visible: personaje, efecto flotante, barra y sonido
  const p = $('personaje');
  p.classList.add(op.tipo);
  const ef = $('efecto');
  ef.textContent = op.tipo === 'bueno' ? '¡Bien! ✅' : op.tipo === 'malo' ? '¡Peligro! 💥' : 'Uf… ⚠️';
  ef.style.color = op.tipo === 'bueno' ? 'var(--verde)' : op.tipo === 'malo' ? 'var(--rojo)' : 'var(--amarillo)';
  ef.classList.remove('mostrar'); void ef.offsetWidth; ef.classList.add('mostrar');
  sonar(op.tipo);
  actualizarHud();

  // Panel de consecuencia
  const c = $('consecuencia');
  c.className = 'consecuencia ' + op.tipo;
  $('consecuencia-tag').textContent = op.tipo === 'bueno' ? '✔ Decisión segura' : op.tipo === 'malo' ? '✖ Decisión de riesgo' : '~ Decisión intermedia';
  $('consecuencia-texto').textContent = op.consecuencia;
  $('consecuencia-cambios').textContent = 'Seguridad ' + signo(op.seg) + '   ·   Fichas ' + signo(op.fichas);
  const esUltima = estado.paso === DECISIONES_POR_NIVEL - 1;
  $('btn-siguiente').textContent = esUltima ? 'Terminar distrito →' : 'Continuar →';
  c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function siguiente() {
  estado.paso++;
  if (estado.paso < DECISIONES_POR_NIVEL) {
    mostrarDecision();
  } else {
    finalizarNivel();
  }
}

function finalizarNivel() {
  const n = estado.nivel;
  const nivel = NIVELES[n];
  estado.resultados[n] = estado.actual;           // guarda (o reemplaza si se repite)
  estado.desbloqueado = Math.max(estado.desbloqueado, Math.min(n + 1, NIVELES.length - 1));
  const res = estado.resultados[n];
  estado.actual = null;                           // ya quedó guardado
  guardar();

  const estrellas = estrellasDe(res.seg);
  $('res-distrito').textContent = nivel.nombre + ' · ' + nivel.condicion;
  $('res-titulo').textContent = estrellas === 3 ? '¡Distrito superado con éxito!' : estrellas === 2 ? 'Distrito superado' : 'Distrito superado… a duras penas';
  $('res-estrellas').textContent = textoEstrellas(estrellas);
  $('res-texto').textContent = estrellas === 3 ? 'Tomaste decisiones seguras en todo el recorrido.' :
    estrellas === 2 ? 'Buen trabajo, aunque pudiste cuidarte más en algún tramo.' :
    'Tomaste riesgos innecesarios. Puedes repetir el distrito para mejorar.';

  const lista = $('res-lista');
  lista.innerHTML = '';
  res.elecciones.forEach(function (e) {
    const li = document.createElement('li');
    li.className = e.tipo;
    li.textContent = e.titulo + ': ' + e.texto + ' (' + signo(e.seg) + ')';
    lista.appendChild(li);
  });

  const esUltimo = (n === NIVELES.length - 1);
  $('btn-res-siguiente').textContent = esUltimo ? 'Ver final →' : 'Siguiente distrito →';
  $('btn-res-siguiente').dataset.destino = esUltimo ? 'final' : String(n + 1);
  $('btn-res-repetir').dataset.nivel = String(n);

  // El HUD debe mostrar los totales reales (nivel ya guardado)
  estado.nivel = n;
  mostrarPantalla('pantalla-resultado');
  const segTotal = calcularSeguridad();
  $('res-seguridad').textContent = segTotal;
  $('res-fichas').textContent = calcularFichas();
}

/* ---------------------------------------------------------
   6. FINAL
   --------------------------------------------------------- */
function mostrarFinal() {
  estado.nivel = null;
  estado.actual = null;
  const seg = calcularSeguridad();
  const fichas = calcularFichas();
  const clave = seg >= 80 ? 'bueno' : seg >= 45 ? 'regular' : 'malo';
  const f = FINALES[clave];

  $('final-emoji').textContent = f.emoji;
  $('final-titulo').textContent = f.titulo;
  $('final-texto').textContent = f.texto;
  $('final-mensaje').textContent = f.mensaje;
  $('final-seguridad').textContent = seg;
  $('final-fichas').textContent = fichas;
  $('tarjeta-final').className = 'tarjeta final-' + clave;

  const lista = $('final-historial');
  lista.innerHTML = '';
  estado.resultados.forEach(function (r, i) {
    if (!r) return;
    r.elecciones.forEach(function (e) {
      const li = document.createElement('li');
      li.className = e.tipo;
      li.textContent = NIVELES[i].nombre + ' · ' + e.titulo + ': ' + e.texto;
      lista.appendChild(li);
    });
  });
  mostrarPantalla('pantalla-final');
  sonar(clave);
}

function reiniciarAventura() {
  estado.resultados = [null, null, null];
  estado.desbloqueado = 0;
  estado.nivel = null;
  estado.actual = null;
  guardar();
  irAlMapa();
}

/* ---------------------------------------------------------
   Decoración visual (ciudad y lluvia generadas con JS)
   --------------------------------------------------------- */
function crearCiudad(n) {
  const ciudad = $('ciudad');
  ciudad.innerHTML = '';
  let semilla = (n + 1) * 9301;                       // aleatorio repetible por distrito
  const rnd = function () { semilla = (semilla * 49297 + 233280) % 233280; return semilla / 233280; };
  const total = window.innerWidth < 600 ? 10 : 18;
  for (let i = 0; i < total; i++) {
    const e = document.createElement('div');
    e.className = 'edificio';
    e.style.height = (35 + rnd() * 65) + '%';
    ciudad.appendChild(e);
  }
}

function crearLluvia() {
  const l = $('lluvia');
  l.innerHTML = '';
  for (let i = 0; i < 50; i++) {
    const g = document.createElement('div');
    g.className = 'gota';
    g.style.left = (Math.random() * 100) + '%';
    g.style.animationDuration = (0.6 + Math.random() * 0.6) + 's';
    g.style.animationDelay = (Math.random() * 1) + 's';
    l.appendChild(g);
  }
}

/* ---------------------------------------------------------
   7. MENÚ, SONIDO Y GUARDADO
   --------------------------------------------------------- */
function abrirMenu() {
  $('menu-reiniciar').disabled = (estado.nivel === null);
  $('menu').classList.remove('oculto');
  $('menu-continuar').focus();
}
function cerrarMenu() { $('menu').classList.add('oculto'); }

/* Sonido simple con Web Audio (no necesita archivos) */
let audioCtx = null;
function tono(frec, dur, tipo, retraso) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime + (retraso || 0);
    const osc = audioCtx.createOscillator();
    const gan = audioCtx.createGain();
    osc.type = tipo || 'sine';
    osc.frequency.value = frec;
    gan.gain.setValueAtTime(0.08, t0);
    gan.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gan); gan.connect(audioCtx.destination);
    osc.start(t0); osc.stop(t0 + dur);
  } catch (e) { /* si el navegador no permite audio, simplemente no suena */ }
}
function sonar(tipo) {
  if (!estado.sonido) return;
  if (tipo === 'bueno') { tono(523, 0.15, 'triangle', 0); tono(784, 0.25, 'triangle', 0.13); }
  else if (tipo === 'malo') { tono(160, 0.35, 'sawtooth', 0); }
  else { tono(330, 0.2, 'square', 0); }
}

/* Guardar progreso en el navegador (localStorage) */
function guardar() {
  try {
    localStorage.setItem('rutaSegura', JSON.stringify({ r: estado.resultados, d: estado.desbloqueado }));
  } catch (e) { /* modo privado: no pasa nada */ }
}
function cargar() {
  try {
    const datos = JSON.parse(localStorage.getItem('rutaSegura'));
    if (datos && Array.isArray(datos.r) && datos.r.length === NIVELES.length) {
      estado.resultados = datos.r;
      estado.desbloqueado = Math.min(datos.d || 0, NIVELES.length - 1);
      return estado.resultados.some(function (r) { return r !== null; });
    }
  } catch (e) { /* ignorar */ }
  return false;
}

/* ---------------------------------------------------------
   8. EVENTOS (conectar botones con funciones)
   --------------------------------------------------------- */
$('btn-jugar').addEventListener('click', function () {
  reiniciarAventura();                       // empieza una aventura nueva
});
$('btn-continuar').addEventListener('click', irAlMapa);
$('btn-como').addEventListener('click', function () { $('como-jugar').classList.toggle('oculto'); });

$('btn-siguiente').addEventListener('click', siguiente);

$('btn-res-siguiente').addEventListener('click', function () {
  const d = this.dataset.destino;
  if (d === 'final') mostrarFinal(); else iniciarNivel(Number(d));
});
$('btn-res-repetir').addEventListener('click', function () { iniciarNivel(Number(this.dataset.nivel)); });
$('btn-res-mapa').addEventListener('click', irAlMapa);

$('btn-ver-final').addEventListener('click', mostrarFinal);
$('btn-reiniciar-todo').addEventListener('click', function () {
  if (confirm('¿Seguro que quieres reiniciar toda la aventura?')) reiniciarAventura();
});
$('btn-inicio').addEventListener('click', function () { mostrarPantalla('pantalla-inicio'); });

$('btn-final-repetir').addEventListener('click', reiniciarAventura);
$('btn-final-mapa').addEventListener('click', irAlMapa);

$('btn-menu').addEventListener('click', abrirMenu);
$('menu-continuar').addEventListener('click', cerrarMenu);
$('menu-reiniciar').addEventListener('click', function () {
  cerrarMenu();
  if (estado.nivel !== null) iniciarNivel(estado.nivel);
});
$('menu-mapa').addEventListener('click', function () { cerrarMenu(); irAlMapa(); });
$('menu-config').addEventListener('click', function () { $('config-panel').classList.toggle('oculto'); });
$('cfg-sonido').addEventListener('change', function () { estado.sonido = this.checked; });
$('cfg-animaciones').addEventListener('change', function () { document.body.classList.toggle('reducir-animaciones', this.checked); });

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if ($('menu').classList.contains('oculto')) abrirMenu(); else cerrarMenu();
  }
});

/* Arranque */
(function iniciar() {
  const hayProgreso = cargar();
  $('btn-continuar').classList.toggle('oculto', !hayProgreso);
  mostrarPantalla('pantalla-inicio');
})();
