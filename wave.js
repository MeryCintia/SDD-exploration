// Parent container
const cnt = document.createElement('div');
cnt.style.cssText = 'display:inline-block;padding:12px;border:1px solid #888;border-radius:6px';
(document.getElementById('wave-box') || document.body).appendChild(cnt);

// Canvas
const canvas = document.createElement('canvas');
canvas.width = 700;
canvas.height = 300;
canvas.style.cssText = 'display:block;border:1px solid #ccc;background:#fff';
cnt.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Textarea (parameters)
const ta = document.createElement('textarea');
ta.rows = 5;
ta.cols = 40;
ta.style.cssText = 'display:block;margin-top:10px;font-family:monospace';
ta.value =
`amplitude = 80      (px)
period = 2          (s)
wavelength = 300    (px)
phase = 0           (degrees)`;
cnt.appendChild(ta);

// Toggle button
const btn = document.createElement('button');
btn.textContent = 'start';
btn.style.cssText = 'margin-top:10px;padding:6px 20px;font-size:16px';
cnt.appendChild(btn);

// State
let running = false;
let t = 0;          // wave time (s)
let last = 0;       // last frame timestamp
let rafId = null;

// Parse "name = number" lines; accepts English and Indonesian spellings
function readParams() {
  const p = { amplitude: 80, period: 2, wavelength: 300, phase: 0 };
  const alias = {
    amplitude: 'amplitude', amplitudo: 'amplitude', a: 'amplitude',
    period: 'period', periode: 'period', t: 'period',
    wavelength: 'wavelength', lambda: 'wavelength', panjang: 'wavelength',
    phase: 'phase', 'initial phase': 'phase', 'initial_phase': 'phase', fase: 'phase'
  };
  for (const line of ta.value.split('\n')) {
    const m = line.match(/^\s*([a-zA-Z_ ]+?)\s*[=:]\s*(-?\d*\.?\d+(?:e[-+]?\d+)?)/i);
    if (!m) continue;
    const key = alias[m[1].toLowerCase()];
    if (key) p[key] = parseFloat(m[2]);
  }
  if (!(p.period > 0)) p.period = 2;
  if (!(p.wavelength > 0)) p.wavelength = 300;
  return p;
}

// y(x,t) = A sin(2π(t/T − x/λ) + φ)  → travels toward +x
function draw() {
  const p = readParams();
  const w = canvas.width, h = canvas.height, mid = h / 2;
  const phi = p.phase * Math.PI / 180;

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, mid);
  ctx.lineTo(w, mid);
  ctx.stroke();

  ctx.strokeStyle = '#1565c0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= w; x++) {
    const y = mid - p.amplitude *
      Math.sin(2 * Math.PI * (t / p.period - x / p.wavelength) + phi);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function frame(now) {
  t += (now - last) / 1000;
  last = now;
  draw();
  rafId = requestAnimationFrame(frame);
}

btn.addEventListener('click', () => {
  running = !running;
  btn.textContent = running ? 'stop' : 'start';
  if (running) {
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  } else {
    cancelAnimationFrame(rafId);
  }
});

// Redraw when parameters are edited while stopped
ta.addEventListener('input', () => { if (!running) draw(); });

draw();
