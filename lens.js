(function () {
  const canvas = document.getElementById('lensCanvas');
  const ctx = canvas.getContext('2d');
  const dSlider = document.getElementById('lensD');
  const fSlider = document.getElementById('lensF');
  const dVal = document.getElementById('lensDVal');
  const fVal = document.getElementById('lensFVal');
  const info = document.getElementById('lensInfo');

  const W = canvas.width, H = canvas.height;
  const SCALE = 2.4;            // pixels per cm
  const CX = W / 2;             // lens position (x = 0 cm)
  const AY = H / 2;             // principal axis (y = 0 cm)
  const S = 240;                // distance pencil -> lens (cm), fixed
  const PENCIL_H = 60;          // pencil height (cm)

  // cm -> pixel helpers (physics: x right, y up; lens at origin)
  const px = x => CX + x * SCALE;
  const py = y => AY - y * SCALE;

  function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(px(x1), py(y1));
    ctx.lineTo(px(x2), py(y2));
    ctx.stroke();
  }

  // Pencil: base on the axis at x0 (cm), height h (cm); negative h = upside down
  function drawPencil(x0, h, color, tipColor, alpha) {
    const L = Math.abs(h) * SCALE;
    const w = Math.max(3, 7 * Math.abs(h) / PENCIL_H);
    const tip = Math.min(30, L * 0.25);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(px(x0), AY);
    if (h < 0) ctx.scale(1, -1);                  // flip for the inverted image
    ctx.fillStyle = color;
    ctx.fillRect(-w, -(L - tip), w * 2, L - tip); // body
    ctx.fillStyle = tipColor;
    ctx.beginPath();                              // sharpened tip
    ctx.moveTo(-w, -(L - tip));
    ctx.lineTo(w, -(L - tip));
    ctx.lineTo(0, -L);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawLens(D, f) {
    const r = D / 2 * SCALE;
    const t = 8 + 600 / f;                        // bulge: shorter f = thicker lens
    ctx.beginPath();
    ctx.moveTo(CX, AY - r);
    ctx.quadraticCurveTo(CX + t * 2, AY, CX, AY + r);
    ctx.quadraticCurveTo(CX - t * 2, AY, CX, AY - r);
    ctx.closePath();
    ctx.fillStyle = 'rgba(30,120,230,0.55)';
    ctx.fill();
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function mark(x, label) {
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(px(x), AY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label, px(x), AY + 20);
  }

  function draw() {
    const D = +dSlider.value, f = +fSlider.value;
    dVal.textContent = D + ' cm';
    fVal.textContent = f + ' cm';

    // thin-lens equation: 1/f = 1/s + 1/s'
    const s = S;
    const si = (s * f) / (s - f);                 // s'  (always real: s > f)
    const m = si / s;                             // magnification size
    const h = PENCIL_H, hi = -h * m;              // image is inverted
    const R = 2 * f;                              // centre of curvature of a lens = 2f
    const half = D / 2;

    ctx.clearRect(0, 0, W, H);

    // dotted principal axis
    ctx.save();
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(0, AY); ctx.lineTo(W, AY); ctx.stroke();
    ctx.restore();

    // focal points (F) and centres of curvature (R = 2F)
    ctx.fillStyle = '#555';
    mark(-f, 'F'); mark(f, 'F');
    mark(-R, 'R'); mark(R, 'R');

    drawLens(D, f);
    drawPencil(-s, h, '#fdd835', '#c79100', 1);              // object (left)
    drawPencil(si, hi, '#fdd835', '#fdd835', 0.3);           // shadow / image (right)

    // ---------- 3 special rays (black) ----------
    ctx.lineWidth = 1.6;

    // draws: object tip -> point on lens plane (y), then onward with given slope
    function ray(yLens, slopeAfter) {
      const hit = Math.abs(yLens) <= half;        // does the ray pass through the lens?
      ctx.strokeStyle = '#000';
      ctx.setLineDash(hit ? [] : [6, 5]);
      ctx.globalAlpha = hit ? 1 : 0.35;
      line(-s, h, 0, yLens);
      if (hit) line(0, yLens, W / SCALE, yLens + slopeAfter * (W / SCALE));
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Ray 1: parallel to axis -> refracted through the right focal point
    ray(h, -h / f);

    // Ray 2: through the left focal point -> leaves parallel to the axis
    const y2 = h - (h / (s - f)) * s;             // height where it meets the lens plane
    ray(y2, 0);

    // Ray 3: aimed at the centre of curvature R = 2f (left side) -> refracts to the image tip
    const y3 = (h * R) / (R - s);                 // height where it meets the lens plane
    if (isFinite(y3) && Math.abs(y3) < 1e4) ray(y3, (hi - y3) / si);

    // labels
    ctx.fillStyle = '#333';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Object', px(-s) + 14, py(h) + 6);
    ctx.fillText('Shadow (image)', px(si) + 14, py(hi) + 4);

    info.innerHTML =
      's = ' + s + ' cm &nbsp;|&nbsp; s\' = ' + si.toFixed(1) + ' cm &nbsp;|&nbsp; ' +
      'magnification = ' + m.toFixed(2) + '× (real, inverted) &nbsp;|&nbsp; R = 2f = ' + R + ' cm';
  }

  dSlider.addEventListener('input', draw);
  fSlider.addEventListener('input', draw);
  draw();
})();
