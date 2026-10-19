# Collective Particles

A classroom example with two stages: a standalone p5.js sketch and a multiplayer p5.js + Socket.IO sketch. Both use the same plain JavaScript particle simulation.

## Run

1. Install Node.js 18 or newer.
2. In this folder, run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000/standalone.html` for the standalone sketch.
5. Open `http://localhost:3000/` for multiplayer. Open in multiple browser tabs or devices.

For classroom devices on the same Wi-Fi, find the host computer's local IP address and open `http://HOST_IP:3000/`. Allow Node through the host firewall. The Wi-Fi must permit device-to-device communication. For access over the public internet, deploy the Node server on a host supporting persistent Socket.IO connections (WebSockets). p5.js is loaded from a CDN, so its initial load requires internet unless you provide a local copy.

## Controls

Hold mouse or touch on the canvas to apply a force. Select Attract, Repel, or Vortex with the buttons or keys 1, 2, and 3.

## Particle motion and color

The field contains 1,800 particles (10 times the original count). Attract, repel,
and vortex use a strength of 0.10 instead of 0.42 and a lower speed limit for
clearer movement. All participants have the same controls.

The server assigns each connection a color, shown beside the connection status
and on its interaction ring. Holding the canvas gradually dyes particles within
240 simulation pixels, with stronger absorption nearer the pointer. Overlapping
users contribute a distance-weighted RGB mixture, independent of input order.
Colors remain after release and can be blended or repainted by later interactions.
Reconnecting assigns a new color. The standalone version uses the same behavior
with one local color and runs at 30 updates per second.

## Architecture

- `shared/simulation.js`: Particle physics in ordinary JavaScript, reusable in browser and Node.
- `public/standalone.js`: Runs the physics locally and draws with p5.js.
- `public/sketch.js`: Draws server-provided positions and sends pointer input.
- `server.js`: Maintains the authoritative simulation at 30 updates per second, even when zero browsers are connected.

There is no database. Restarting the server resets the simulation. The physics update is tied to interval timing, so it is a teaching example rather than a high-precision physics engine.

## Tests

Run `npm test` to check particle count, forces, gradual color absorption, overlapping
color mixtures, inactive inputs, and participant color assignment.

## Online hosting and portfolio integration

See [DEPLOYMENT.md](DEPLOYMENT.md). `render.yaml` configures a single Node
service, `/healthz` reports server health, and `/embed.html` provides a compact
multiplayer view for embedding in GitHub Pages.
