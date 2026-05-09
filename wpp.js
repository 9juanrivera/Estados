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

// Generar botones de paleta
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

// Texto en tiempo real
msgBox.addEventListener('input', () => {
  texto.textContent = msgBox.value || ' ';
});

// Tamaño
texto.style.fontSize = '60px';
sizeR.addEventListener('input', () => {
  sizeV.textContent = sizeR.value + 'px';
  texto.style.fontSize = sizeR.value + 'px';
});

// Blur
blurR.addEventListener('input', () => {
  const v = parseFloat(blurR.value).toFixed(1);
  blurV.textContent = v + 'px';
  texto.style.filter = `blur(${v}px)`;
});

// Colores personalizados
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

  html2canvas(document.getElementById('estado-preview'), {
    scale: 2,          // doble resolución para que quede nítida
    useCORS: true,
    backgroundColor: null
  }).then(canvas => {
    const enlace = document.createElement('a');
    enlace.download = 'Estado.png';
    enlace.href = canvas.toDataURL('Estados/png');
    enlace.click();

    btnCaptura.textContent = textoOriginal;
    btnCaptura.classList.remove('cargando');
    btnCaptura.disabled = false;
  }).catch(() => {
    btnCaptura.textContent = 'Error al capturar';
    btnCaptura.classList.remove('cargando');
    btnCaptura.disabled = false;
  });
});