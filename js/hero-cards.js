(() => {
  'use strict';
  const hero = document.querySelector('[data-card-trail]') || document.querySelector('.hero');
  const layer = hero?.querySelector('.hero-card-trail, .about-card-trail');
  const replay = document.querySelector('.cards-replay');
  if (!hero || !layer) return;
  const cards = [...layer.querySelectorAll('img')];
  const animations = new Map();
  const timers = new Set();
  let next = 0;
  let previous = null;
  let lastTime = 0;
  let sequence = 0;
  const enabled = () => !document.documentElement.classList.contains('motion-off');

  function showCard(x, y) {
    if (!enabled() || !cards.length) return;
    const card = cards[next++ % cards.length];
    animations.get(card)?.cancel();
    const rect = hero.getBoundingClientRect();
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const rotation = (Math.random() - .5) * 34;
    card.style.left = `${Math.max(w / 2, Math.min(rect.width - w / 2, x))}px`;
    card.style.top = `${Math.max(h / 2, Math.min(rect.height - h / 2, y))}px`;
    card.style.zIndex = String(++sequence);
    const transform = scale => `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
    const animation = card.animate([
      { opacity: 0, transform: transform(.35), offset: 0 },
      { opacity: 1, transform: transform(1), offset: .18 },
      { opacity: 1, transform: transform(1), offset: .64 },
      { opacity: 0, transform: transform(.15), offset: 1 }
    ], { duration: 900, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'none' });
    animations.set(card, animation);
    animation.onfinish = () => { if (animations.get(card) === animation) animations.delete(card); };
  }

  hero.addEventListener('pointermove', event => {
    if (!enabled() || event.target.closest('a, button')) { previous = null; return; }
    const rect = hero.getBoundingClientRect();
    const position = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const distance = previous ? Math.hypot(position.x - previous.x, position.y - previous.y) : Infinity;
    if (distance < (event.pointerType === 'touch' ? 65 : 100) || performance.now() - lastTime < 65) return;
    showCard(position.x, position.y);
    previous = position;
    lastTime = performance.now();
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { previous = null; });
  hero.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || event.target.closest('a, button')) return;
    const rect = hero.getBoundingClientRect();
    showCard(event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: true });

  replay?.addEventListener('click', () => {
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    // Keyboard and touch users can play the same trail without a mouse gesture.
    const rect = hero.getBoundingClientRect();
    cards.forEach((card, index) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        showCard(rect.width * (.22 + .56 * index / (cards.length - 1)), rect.height * (.45 + Math.sin(index * .85) * .14));
      }, index * 110);
      timers.add(timer);
    });
  });
  const sync = () => {
    if (replay) replay.disabled = !enabled();
    previous = null;
    if (!enabled()) {
      animations.forEach(animation => animation.cancel());
      animations.clear();
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    }
  };
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
