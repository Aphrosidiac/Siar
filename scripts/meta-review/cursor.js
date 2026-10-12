(() => {
  const hide = () => { for (const id of ['claude-agent-glow-border', 'claude-static-indicator-container']) { const e = document.getElementById(id); if (e && e.style.display !== 'none') e.style.setProperty('display', 'none', 'important'); } };
  hide();
  if (window.__recCursor) return 'already';
  window.__recCursor = true;
  const NS = 'http://www.w3.org/2000/svg';
  const c = document.createElement('div'); c.id = '__rec-cursor';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '34'); svg.setAttribute('height', '34'); svg.setAttribute('viewBox', '0 0 24 24');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', 'M5 3l14 8.2-6.3 1.3 3.6 6.6-2.7 1.4-3.6-6.6L5 18.6z');
  p.setAttribute('fill', '#0b0b0a'); p.setAttribute('stroke', '#ffffff'); p.setAttribute('stroke-width', '1.6'); p.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(p); c.appendChild(svg);
  let last = null;
  try { last = JSON.parse(sessionStorage.getItem('__recCursorPos') || 'null'); } catch {}
  const start = last || { x: innerWidth * 0.5, y: innerHeight * 0.6 };
  const at = (x, y) => `translate(${x - 7}px, ${y - 4}px)`;
  Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: '2147483647', pointerEvents: 'none', transform: at(start.x, start.y), transition: 'transform 420ms cubic-bezier(.3,.7,.2,1)', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.35))' });
  const mount = () => { if (!c.isConnected) (document.body || document.documentElement).appendChild(c); hide(); };
  mount();
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  const move = (e) => { c.style.transform = at(e.clientX, e.clientY); try { sessionStorage.setItem('__recCursorPos', JSON.stringify({ x: e.clientX, y: e.clientY })); } catch {} };
  addEventListener('mousemove', move, true);
  addEventListener('pointermove', move, true);
  addEventListener('mousedown', (e) => {
    move(e);
    const r = document.createElement('div');
    Object.assign(r.style, { position: 'fixed', left: `${e.clientX}px`, top: `${e.clientY}px`, width: '52px', height: '52px', margin: '-26px 0 0 -26px', borderRadius: '50%', border: '3px solid rgba(11,11,10,.65)', background: 'rgba(11,11,10,.12)', zIndex: '2147483646', pointerEvents: 'none', transition: 'transform 520ms ease-out, opacity 520ms ease-out', transform: 'scale(.25)', opacity: '.7' });
    (document.body || document.documentElement).appendChild(r);
    requestAnimationFrame(() => requestAnimationFrame(() => { r.style.transform = 'scale(1)'; r.style.opacity = '0'; }));
    setTimeout(() => r.remove(), 650);
  }, true);
  return 'installed';
})();
