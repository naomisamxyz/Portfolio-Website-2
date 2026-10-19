const appURL = window.COLLECTIVE_PARTICLES_URL;
if (appURL) {
  try {
    const base = new URL(appURL);
    if (base.protocol !== 'https:') throw new Error('Hosting requires HTTPS');
    const frame = document.createElement('iframe');
    frame.src = new URL('/embed.html', base).href;
    frame.title = 'Collective Particles — shared interactive field';
    frame.loading = 'lazy';
    document.getElementById('particle-field').replaceChildren(frame);
    const link = document.getElementById('open-field');
    link.href = base.origin + '/';
    link.hidden = false;
  } catch (error) {
    console.error('Invalid particle field hosting URL', error);
  }
}
