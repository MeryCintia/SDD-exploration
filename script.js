const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('toggle');

const source = { x: 70, y: canvas.height / 2, r: 22 };
const electron = { x: 680, y: canvas.height / 2, nucleus: 14, shell: 55 };

let lightOn = false;
let beamLen = 0;
const speed = 8;
const beamStart = source.x + source.r;
const beamEnd = electron.x - electron.shell;
let offset = 0;

btn.addEventListener('click', () => {
  lightOn = !lightOn;
  btn.textContent = lightOn ? 'Stop' : 'Start';
  btn.classList.toggle('on', lightOn);
  if (!lightOn) beamLen = 0;
});

function drawSource() {
  ctx.save();
  if (lightOn) {
    ctx.shadowColor = '#ffeb3b';
    ctx.shadowBlur = 30;
  }
  ctx.fillStyle = lightOn ? '#ffeb3b' : '#666';
  ctx.beginPath();
  ctx.arc(source.x, source.y, source.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#aaa';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Light source', source.x, source.y + source.r + 22);
}

function drawElectron() {
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(electron.x, electron.y, electron.shell, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#4fc3f7';
  ctx.beginPath();
  ctx.arc(electron.x, electron.y, electron.nucleus, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f0e0e';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Electron', electron.x, electron.y + electron.shell + 22);
}

function drawBeam() {
  if (!lightOn || beamLen <= 0) return;

  const x1 = beamStart;
  const x2 = beamStart + beamLen;
  ctx.save();

  const gradient = ctx.createLinearGradient(0, source.y - 10, 0, source.y + 10);
  gradient.addColorStop(0, 'rgba(255,235,59,0)');
  gradient.addColorStop(0.5, 'rgba(255,235,59,0.35)');
  gradient.addColorStop(1, 'rgba(255,235,59,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x1, source.y - 10, x2 - x1, 20);

  ctx.strokeStyle = '#fff59d';
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 10]);
  ctx.lineDashOffset = -offset;
  ctx.beginPath();
  ctx.moveTo(x1, source.y);
  ctx.lineTo(x2, source.y);
  ctx.stroke();
  ctx.restore();
}

function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (lightOn) {
    beamLen = Math.min(beamLen + speed, beamEnd - beamStart);
    offset += speed * 0.6;
  }
  drawBeam();
  drawSource();
  drawElectron();
  requestAnimationFrame(frame);
}

frame();
