// Plain JavaScript simulation shared by the standalone sketch and Node server.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ParticleSimulation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const WIDTH = 900;
  const HEIGHT = 600;
  const COUNT = 1800;
  const BASE_COLOR = [255, 255, 255];
  const retainedOrbits = new WeakMap();
  const MODES = ['attract', 'repel', 'vortex'];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function createSimulation() {
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color: BASE_COLOR.slice()
    }));
    return { particles, tick: 0 };
  }

  // Inputs use coordinates normalized to 0..1, so all screen sizes work.
  function step(simulation, inputs) {
    const activeInputs = Object.values(inputs).filter(input => input.active && MODES.includes(input.mode));
    for (const p of simulation.particles) {
      let ax = 0;
      let ay = 0;
      let weight = 0;
      const vortexOrbits = [];
      const pigment = [0, 0, 0];
      for (const input of activeInputs) {
        const dx = input.x * WIDTH - p.x;
        const dy = input.y * HEIGHT - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= 240) continue;
        if (input.mode !== 'vortex') retainedOrbits.delete(p);
        const falloff = (1 - distance / 240);
        const strength = 0.10 * falloff;
        // Accumulate all pigments before blending: input order cannot bias color.
        if (input.color) {
          weight += falloff;
          for (let c = 0; c < 3; c++) pigment[c] += input.color[c] * falloff;
        }
        if (distance < 0.001) continue;
        const nx = dx / distance;
        const ny = dy / distance;
        if (input.mode === 'attract') { ax += nx * strength; ay += ny * strength; }
        if (input.mode === 'repel') { ax -= nx * strength; ay -= ny * strength; }
        if (input.mode === 'vortex') {
          const orbit = { x: input.x * WIDTH, y: input.y * HEIGHT, radius: distance };
          vortexOrbits.push(orbit);
          retainedOrbits.set(p, orbit);
          // Balance sideways motion with centripetal acceleration, rather than
          // letting inertia fling particles out of the interaction area.
          const tangentSpeed = -ny * p.vx + nx * p.vy;
          const inwardSpeed = nx * p.vx + ny * p.vy;
          const radius = Math.max(distance, 12);
          const inward = tangentSpeed * tangentSpeed / radius
            - inwardSpeed * 0.20 * falloff;
          ax += -ny * strength + nx * inward;
          ay += nx * strength + ny * inward;
        }
      }
      // After release, retain the last center while gradually reducing speed. Other
      // force modes can pick these particles up and replace their orbit.
      let releasedSpeed = 0;
      const retained = retainedOrbits.get(p);
      if (vortexOrbits.length === 0 && retained) {
        const dx = retained.x - p.x;
        const dy = retained.y - p.y;
        const radius = Math.hypot(dx, dy);
        if (radius > 0.001) {
          releasedSpeed = Math.hypot(p.vx, p.vy) * 0.995;
          const speed = releasedSpeed;
          ax += dx / radius * speed * speed / Math.max(radius, 12);
          ay += dy / radius * speed * speed / Math.max(radius, 12);
          vortexOrbits.push({ ...retained, radius });
        }
      }
      if (weight > 0) {
        const absorption = 1 - Math.exp(-0.045 * weight);
        for (let c = 0; c < 3; c++) {
          p.color[c] += (pigment[c] / weight - p.color[c]) * absorption;
        }
      }
      p.vx = clamp((p.vx + ax) * 0.987, -2.5, 2.5);
      p.vy = clamp((p.vy + ay) * 0.987, -2.5, 2.5);
      let nextX = p.x + p.vx;
      let nextY = p.y + p.vy;
      // Correct discrete integration drift: sideways movement must not increase
      // the orbit radius. Remove outward velocity so it cannot build up either.
      for (const orbit of vortexOrbits) {
        const dx = nextX - orbit.x;
        const dy = nextY - orbit.y;
        const radius = Math.hypot(dx, dy);
        if (radius < 0.001 || (releasedSpeed === 0 && radius <= orbit.radius)) continue;
        const nx = dx / radius;
        const ny = dy / radius;
        nextX = orbit.x + nx * orbit.radius;
        nextY = orbit.y + ny * orbit.radius;
        const outward = Math.max(0, p.vx * nx + p.vy * ny);
        p.vx -= outward * nx;
        p.vy -= outward * ny;
      }
      if (releasedSpeed > 0) {
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 0) { p.vx *= releasedSpeed / speed; p.vy *= releasedSpeed / speed; }
      }
      p.x = (nextX + WIDTH) % WIDTH;
      p.y = (nextY + HEIGHT) % HEIGHT;
    }
    simulation.tick++;
    return simulation;
  }

  // Golden-angle hues keep consecutive participants visually separated.
  function userColor(index) {
    const h = ((index * 137.507764) % 360) / 60;
    const x = 1 - Math.abs(h % 2 - 1);
    const rgb = h < 1 ? [1,x,0] : h < 2 ? [x,1,0] : h < 3 ? [0,1,x]
      : h < 4 ? [0,x,1] : h < 5 ? [x,0,1] : [1,0,x];
    return rgb.map(c => Math.round(65 + c * 190));
  }

  return { WIDTH, HEIGHT, COUNT, MODES, userColor, createSimulation, step };
});
