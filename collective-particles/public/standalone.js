// STANDALONE: the same physics runs directly in the browser.
const { WIDTH, HEIGHT, createSimulation, step, userColor } = ParticleSimulation;
const simulation = createSimulation();
const myColor = userColor(0);
const inputs = { me: { x: 0.5, y: 0.5, active: false, mode: 'attract', color: myColor } };
let mode = 'attract';
let active = false;

function setup() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent('canvas-holder');
  frameRate(30);
  canvas.elt.addEventListener('pointerdown', e => { active = true; canvas.elt.setPointerCapture(e.pointerId); updateInput(e); });
  canvas.elt.addEventListener('pointermove', e => { if (active) updateInput(e); });
  canvas.elt.addEventListener('pointerup', e => { active = false; updateInput(e); });
  canvas.elt.addEventListener('pointercancel', e => { active = false; updateInput(e); });
  canvas.elt.addEventListener('lostpointercapture', () => { active = false; inputs.me.active = false; });
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => selectMode(b.dataset.mode)));
}
function updateInput(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  inputs.me = {
    x: constrain((event.clientX - rect.left) / rect.width, 0, 1),
    y: constrain((event.clientY - rect.top) / rect.height, 0, 1),
    active, mode, color: myColor
  };
}
function selectMode(nextMode) {
  mode = nextMode;
  inputs.me.mode = mode;
  document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('selected', b.dataset.mode === mode));
}
function keyPressed() {
  if (key === '1') selectMode('attract');
  if (key === '2') selectMode('repel');
  if (key === '3') selectMode('vortex');
}
function draw() {
  step(simulation, inputs);
  background(0);
  noStroke();
  for (const p of simulation.particles) { fill(...p.color, 210); circle(p.x, p.y, 3); }
  if (active) { noFill(); stroke(...myColor); strokeWeight(2); circle(inputs.me.x * WIDTH, inputs.me.y * HEIGHT, 28); }
}
