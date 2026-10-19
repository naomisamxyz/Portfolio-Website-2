// MULTIPLAYER: p5 draws server state; the server calculates movement.
const socket = io();
const WIDTH = 900;
const HEIGHT = 600;
let particles = [];
let mode = 'attract';
let players = 0;
let tick = 0;
let active = false;
let myColor = [145, 209, 255];
let pointer = { x: WIDTH / 2, y: HEIGHT / 2 };

function setup() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent('canvas-holder');
  canvas.elt.addEventListener('pointerdown', e => { active = true; canvas.elt.setPointerCapture(e.pointerId); sendInput(e); });
  canvas.elt.addEventListener('pointermove', e => { if (active) sendInput(e); });
  canvas.elt.addEventListener('pointerup', e => { active = false; sendInput(e); });
  canvas.elt.addEventListener('pointercancel', e => { active = false; sendInput(e); });
  canvas.elt.addEventListener('lostpointercapture', () => { active = false; socket.emit('input', { x: 0.5, y: 0.5, active: false, mode }); });
  setupControls();
}

function sendInput(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  pointer = { x: constrain((event.clientX - rect.left) / rect.width, 0, 1) * WIDTH, y: constrain((event.clientY - rect.top) / rect.height, 0, 1) * HEIGHT };
  socket.emit('input', {
    x: constrain((event.clientX - rect.left) / rect.width, 0, 1),
    y: constrain((event.clientY - rect.top) / rect.height, 0, 1),
    active, mode
  });
}

function setupControls() {
  document.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => selectMode(button.dataset.mode));
  });
}
function selectMode(nextMode) {
  mode = nextMode;
  document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('selected', b.dataset.mode === mode));
}
function keyPressed() {
  if (key === '1') selectMode('attract');
  if (key === '2') selectMode('repel');
  if (key === '3') selectMode('vortex');
}

socket.on('identity', data => {
  myColor = data.color;
  const badge = document.getElementById('your-color');
  badge.style.color = `rgb(${myColor.join(',')})`;
  badge.textContent = '● Your color';
});
socket.on('state', data => { particles = data.particles; tick = data.tick; });
socket.on('players', count => { players = count; updateStatus(); });
socket.on('connect', updateStatus);
socket.on('disconnect', () => { active = false; updateStatus(); });
function updateStatus() {
  document.getElementById('status').textContent = socket.connected
    ? `Connected · ${players} participant(s) · simulation tick ${tick}`
    : 'Disconnected. Waiting to reconnect…';
}

function draw() {
  background(0);
  noStroke();
  for (const p of particles) { fill(...p.color, 210); circle(p.x, p.y, 3); }
  if (active) {
    noFill(); stroke(...myColor); strokeWeight(2);
    circle(pointer.x, pointer.y, 28);
  }
  if (frameCount % 30 === 0) updateStatus();
}
