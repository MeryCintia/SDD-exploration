(() => {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('strength');
  const valLabel = document.getElementById('val');
  const flipBtn = document.getElementById('flip');

  const W = canvas.width, H = canvas.height;
  const magnet = { x: W/2, y: H/2, w: 260, h: 60, leftIsNorth: true };
  const compass = { x: W/2, y: H/2 + 150, r: 38, angle: 0, vel: 0 }; // angle = direction the red (N) end points
  let strength = 0.7;
  let dragging = false, offX = 0, offY = 0;

  slider.addEventListener('input', () => {
    strength = slider.value / 100;
    valLabel.textContent = slider.value + '%';
  });
  flipBtn.addEventListener('click', () => { magnet.leftIsNorth = !magnet.leftIsNorth; });

  // pole positions (magnetic "charges": North +1, South -1)
  function poles() {
    const l = { x: magnet.x - magnet.w/2 + 10, y: magnet.y, q: magnet.leftIsNorth ? 1 : -1 };
    const r = { x: magnet.x + magnet.w/2 - 10, y: magnet.y, q: magnet.leftIsNorth ? -1 : 1 };
    return [l, r];
  }

  // magnetic field vector at a point (points away from N, toward S)
  function field(px, py) {
    let bx = 0, by = 0;
    for (const p of poles()) {
      const dx = px - p.x, dy = py - p.y;
      const d2 = dx*dx + dy*dy + 400;       // softening avoids infinity
      const inv = p.q / (d2 * Math.sqrt(d2));
      bx += dx * inv; by += dy * inv;
    }
    return { bx, by };
  }

  // pointer handling
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  }
  canvas.addEventListener('pointerdown', e => {
    const p = pos(e);
    if (Math.hypot(p.x - compass.x, p.y - compass.y) <= compass.r) {
      dragging = true; offX = compass.x - p.x; offY = compass.y - p.y;
      canvas.setPointerCapture(e.pointerId); canvas.classList.add('drag');
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const p = pos(e);
    compass.x = Math.min(W - compass.r, Math.max(compass.r, p.x + offX));
    compass.y = Math.min(H - compass.r, Math.max(compass.r, p.y + offY));
  });
  const stop = () => { dragging = false; canvas.classList.remove('drag'); };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  // physics: needle aligns with field, damped spring
  function update() {
    const { bx, by } = field(compass.x, compass.y);
    const mag = Math.hypot(bx, by);
    if (mag > 1e-12) {
      const target = Math.atan2(by, bx);
      const diff = Math.atan2(Math.sin(target - compass.angle), Math.cos(target - compass.angle));
      compass.vel += 0.12 * strength * Math.min(1, mag * 9000 + 0.15) * Math.sin(diff);
    }
    compass.vel *= 0.90;                 // damping
    compass.angle += compass.vel;
  }

  // drawing
  function drawMagnet() {
    const x0 = magnet.x - magnet.w/2, y0 = magnet.y - magnet.h/2, half = magnet.w/2;
    const leftColor  = magnet.leftIsNorth ? '#e53935' : '#1e63e0';
    const rightColor = magnet.leftIsNorth ? '#1e63e0' : '#e53935';
    ctx.fillStyle = leftColor;  ctx.fillRect(x0, y0, half, magnet.h);
    ctx.fillStyle = rightColor; ctx.fillRect(x0 + half, y0, half, magnet.h);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, magnet.w, magnet.h);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 34px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(magnet.leftIsNorth ? 'N' : 'S', x0 + half/2, magnet.y + 2);
    ctx.fillText(magnet.leftIsNorth ? 'S' : 'N', x0 + half*1.5, magnet.y + 2);
  }

  function drawCompass() {
    const { x, y, r, angle } = compass;
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2);
    ctx.fillStyle = '#fdfdfd'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = '#444'; ctx.stroke();
    ctx.rotate(angle);
    const L = r - 6, w = 7;
    ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(0, -w); ctx.lineTo(0, w); ctx.closePath();
    ctx.fillStyle = '#e53935'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#555'; ctx.stroke(); // North: red
    ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(0, -w); ctx.lineTo(0, w); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke();                                              // South: white
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fillStyle = '#222'; ctx.fill();
    ctx.restore();
  }

  function loop() {
    update();
    ctx.clearRect(0, 0, W, H);
    drawMagnet();
    drawCompass();
    requestAnimationFrame(loop);
  }
  loop();
})();
