const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { createSimulation, step, MODES, userColor } = require('./shared/simulation');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = Number(process.env.PORT) || 3000;
const simulation = createSimulation();
let nextColor = 0;
const inputs = Object.create(null);

app.get('/healthz', (_req, res) => res.json({ status: 'ok', tick: simulation.tick }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/shared', express.static(path.join(__dirname, 'shared')));

io.on('connection', socket => {
  inputs[socket.id] = { x: 0.5, y: 0.5, active: false, mode: 'attract', color: userColor(nextColor++) };
  socket.emit('identity', { color: inputs[socket.id].color });
  socket.emit('state', { particles: simulation.particles, tick: simulation.tick });
  io.emit('players', Object.keys(inputs).length);

  socket.on('input', data => {
    if (!data || typeof data !== 'object') return;
    const x = Number(data.x);
    const y = Number(data.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    inputs[socket.id] = {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      color: inputs[socket.id].color,
      active: data.active === true,
      mode: MODES.includes(data.mode) ? data.mode : 'attract'
    };
  });

  socket.on('disconnect', () => {
    delete inputs[socket.id];
    io.emit('players', Object.keys(inputs).length);
  });
});

// The simulation continues even with zero connected browsers.
setInterval(() => {
  step(simulation, inputs);
  io.emit('state', { particles: simulation.particles, tick: simulation.tick });
}, 1000 / 30);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Collective Particles: http://localhost:${PORT}`);
});
