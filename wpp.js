const paletas = [
  ['#128c7e','#25d366'],
  ['#075e54','#0a3d36'],
  ['#7F77DD','#D4537E'],
  ['#D85A30','#EF9F27'],
  ['#378ADD','#5DCAA5'],
  ['#E24B4A','#D4537E'],
  ['#1a1a2e','#16213e'],
  ['#533489','#7F77DD'],
  ['#185FA5','#1D9E75'],
  ['#BA7517','#D85A30'],
  ['#993556','#7F77DD'],
  ['#2C2C2A','#888780'],
];

const preview = document.getElementById('estado-preview');
const texto   = document.getElementById('estado-texto');
const msgBox  = document.getElementById('msg-box');
const sizeR   = document.getElementById('size-r');
const sizeV   = document.getElementById('size-v');
const blurR   = document.getElementById('blur-r');
const blurV   = document.getElementById('blur-v');
const c1      = document.getElementById('c1');
const c2      = document.getElementById('c2');
const palEl   = document.getElementById('paleta');
let   active  = null;

function setBg() {
  preview.style.background = `linear-gradient(135deg, ${c1.value}, ${c2.value})`;
}

paletas.forEach(([a, b], i) => {
  const s = document.createElement('button');
  s.className = 'sw' + (i === 0 ? ' active' : '');
  s.style.background = `linear-gradient(135deg, ${a}, ${b})`;
  s.title = `Fondo ${i + 1}`;
  if (i === 0) active = s;
  s.onclick = () => {
    if (active) active.classList.remove('active');
    s.classList.add('active');
    active = s;
    c1.value = a;
    c2.value = b;
    setBg();
  };
  palEl.appendChild(s);
});

msgBox.addEventListener('input', () => {
  texto.textContent = msgBox.value || ' ';
});

texto.style.fontSize = '60px';
sizeR.addEventListener('input', () => {
  sizeV.textContent = sizeR.value + 'px';
  texto.style.fontSize = sizeR.value + 'px';
});

blurR.addEventListener('input', () => {
  const v = parseFloat(blurR.value).toFixed(1);
  blurV.textContent = v + 'px';
  texto.style.filter = `blur(${v}px)`;
});

c1.addEventListener('input', () => {
  if (active) { active.classList.remove('active'); active = null; }
  setBg();
});
c2.addEventListener('input', () => {
  if (active) { active.classList.remove('active'); active = null; }
  setBg();
});

// ── CAPTURA Y DESCARGA ──
const btnCaptura = document.getElementById('btn-captura');

btnCaptura.addEventListener('click', () => {
  const textoOriginal = btnCaptura.textContent;
  btnCaptura.textContent = 'Generando imagen...';
  btnCaptura.classList.add('cargando');
  btnCaptura.disabled = true;

  const rect   = preview.getBoundingClientRect();
  const escala = Math.max(window.devicePixelRatio || 1, 3);
  const W      = Math.round(rect.width)  * escala;
  const H      = Math.round(rect.height) * escala;

  const canvas  = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx     = canvas.getContext('2d');

  // 1. Fondo con gradiente 135°
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, c1.value);
  grad.addColorStop(1, c2.value);
  ctx.fillStyle = grad;

  const r = 20 * escala;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(W - r, 0);
  ctx.quadraticCurveTo(W, 0, W, r);
  ctx.lineTo(W, H - r);
  ctx.quadraticCurveTo(W, H, W - r, H);
  ctx.lineTo(r, H);
  ctx.quadraticCurveTo(0, H, 0, H - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // 2. Texto con blur aplicado en canvas (igual al preview)
  const fontSize   = parseFloat(texto.style.fontSize || '60') * escala;
  const blurValor  = parseFloat(blurR.value); // valor original en px del CSS
  const blurCanvas = blurValor * escala;       // escalado para el canvas
  const mensaje    = msgBox.value || ' ';

  ctx.font         = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle    = '#ffffff';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  // Sombra suave
  ctx.shadowColor   = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur    = 20 * escala;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2 * escala;

  // ✅ Aquí se aplica el blur al texto en el canvas
  if (blurCanvas > 0) {
    ctx.filter = `blur(${blurCanvas}px)`;
  }

  // Word-wrap manual
  const maxWidth   = W - 48 * escala;
  const lineHeight = fontSize * 1.2;
  const lineas     = [];
  let lineaActual  = '';

  for (const token of mensaje.split('\n')) {
    const palabras = token.split(' ');
    let linea = '';
    for (const p of palabras) {
      const prueba = linea ? linea + ' ' + p : p;
      if (ctx.measureText(prueba).width > maxWidth && linea) {
        lineas.push(linea);
        linea = p;
      } else {
        linea = prueba;
      }
    }
    lineas.push(linea);
  }

  const totalAltura = lineas.length * lineHeight;
  let y = H / 2 - totalAltura / 2 + lineHeight / 2;
  for (const linea of lineas) {
    ctx.fillText(linea, W / 2, y);
    y += lineHeight;
  }

  // 3. Descargar
  const enlace    = document.createElement('a');
  enlace.download = 'Estado.png';
  enlace.href     = canvas.toDataURL('image/png');
  enlace.click();

  btnCaptura.textContent = textoOriginal;
  btnCaptura.classList.remove('cargando');
  btnCaptura.disabled = false;
});