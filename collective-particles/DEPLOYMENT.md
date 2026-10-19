# Put Collective Particles in the portfolio

## Host the app on Render

Upload this project to a GitHub repository (exclude node_modules). In Render,
create a Blueprint from that repository to use render.yaml, or create a Node
Web Service with build command `npm ci`, start command `npm start`, and health
check `/healthz`. The project folder must be the service root directory.

The included configuration selects the free instance. Free instances sleep
when unused and may take about a minute to wake up. Their simulation does not
continue while asleep. For continuous simulation with no visitors, select an
always-on paid instance after reviewing its cost. Run just one instance:
the shared field lives in memory, and restarts or deploys reset it to white.

## Embed in GitHub Pages

Once Render provides the real HTTPS app URL, replace APP_URL below with it.
Put this markup in the portfolio project page:

```html
<iframe
  src="APP_URL/embed.html"
  title="Collective Particles — shared interactive field"
  style="display:block;width:100%;height:1000px;border:0;background:white"
  loading="lazy">
</iframe>
<p><a href="APP_URL/" target="_blank" rel="noopener">[ OPEN FULL SCREEN ]</a></p>
```

The iframe loads the interface and Socket.IO from the same hosted app.
No separate server URL or cross-origin Socket.IO configuration is required.
All visitors, whether embedded or opening the app directly, join the same field.
Do not publish the Node project as a GitHub Pages app: embed its hosted URL.
The iframe needs enough height for the canvas and controls; adjust for the
portfolio layout. The full-screen link provides an alternative on small screens.

## Verify after deployment

1. Open the hosted app in two browser tabs or devices.
2. Confirm both report two participants and show distinct identity colors.
3. Hold the canvas in one tab and confirm the other shows the same movement/color.
4. Release a vortex and confirm it keeps orbiting while gradually slowing.
5. Open the portfolio page and repeat the interaction in its embedded view.

Hosting documentation: https://render.com/docs/deploy-node-express-app
Free instance behavior: https://render.com/docs/free

## Selected portfolio location

The user selected the free demo and Week 7. The prepared integration is in
`portfolio-integration/week7/`, with matching files in the local portfolio
repository at `week7/`. After deployment, set `COLLECTIVE_PARTICLES_URL` in
`week7/config.js` to the real HTTPS Render URL, then publish the portfolio.
Until that URL is configured, Week 7 shows a coming-soon message rather than
a broken connection. No deployment or portfolio push has been performed.
