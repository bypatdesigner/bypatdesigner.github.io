(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('.motion-toggle');
  let motionOverride = true;
  try { motionOverride = localStorage.getItem('bypat-plinth-motion') !== 'reduced'; } catch { /* Automatic motion remains available without storage. */ }
  const motionDisabled = () => !motionOverride;
  const dialog = document.getElementById('menu-dialog');
  const menuToggle = document.querySelector('.menu-toggle');
  const themeToggle = document.querySelector('.theme-toggle');
  const time = document.getElementById('local-time');
  const stack = document.querySelector('.stack-section');
  const stackFront = document.querySelector('.stack-image-front');
  const stackBack = document.querySelector('.stack-image-back');
  const stackLines = [...document.querySelectorAll('.stack-type span')];
  const contact = document.querySelector('.contact-section');
  const contactImage = document.querySelector('.contact-image');
  const scenes = [...document.querySelectorAll('.project-scene')];
  const preview = document.getElementById('service-preview');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  let menuDestination = null;

  function updateTime() {
    const now = new Date();
    time.textContent = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' }).format(now);
    time.dateTime = now.toISOString();
  }
  updateTime();
  window.setInterval(updateTime, 60000);
  document.getElementById('year').textContent = new Date().getFullYear();

  function setTheme(light) {
    root.classList.toggle('light', light);
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.setAttribute('aria-label', light ? 'Attiva tema scuro' : 'Attiva tema chiaro');
  }
  try { setTheme(localStorage.getItem('bypat-plinth-theme') === 'light'); } catch { /* Storage can be unavailable in private browsing. */ }
  themeToggle.addEventListener('click', () => {
    const light = !root.classList.contains('light');
    setTheme(light);
    try { localStorage.setItem('bypat-plinth-theme', light ? 'light' : 'dark'); } catch { /* The toggle still works without persistence. */ }
  });

  menuToggle.addEventListener('click', () => {
    menuDestination = null;
    dialog.showModal();
    document.body.classList.add('menu-open');
  });
  document.getElementById('menu-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('menu-open');
    (menuDestination || menuToggle).focus({ preventScroll: true });
    menuDestination = null;
  });
  dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    if (link.hash) {
      const destination = document.querySelector(link.hash);
      if (destination) {
        destination.setAttribute('tabindex', '-1');
        menuDestination = destination;
      }
    }
    dialog.close();
  }));

  document.querySelectorAll('.service').forEach(service => {
    const updatePreview = () => { preview.src = service.dataset.preview; };
    service.addEventListener('pointerenter', updatePreview);
    service.addEventListener('focusin', updatePreview);
    service.addEventListener('toggle', () => {
      if (!service.open) return;
      updatePreview();
      document.querySelectorAll('.service').forEach(other => { if (other !== service) other.open = false; });
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    root.classList.add('js');
  }

  // Keep the browser's native scroll; sticky stages provide the scrubbed sequence.
  scenes.forEach(scene => {
    const pin = document.createElement('div');
    pin.className = 'scene-pin';
    while (scene.firstChild) pin.appendChild(scene.firstChild);
    scene.appendChild(pin);
  });
  const hero = document.querySelector('.hero-layout');
  const heroSection = document.querySelector('.hero');
  const heroPreview = document.querySelector('.hero-preview');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const stackLink = document.createElement('a');
  stackLink.className = 'stack-project-link';
  stackLink.href = 'eureka.html';
  stackLink.innerHTML = '<strong>Eureka</strong><span>Scopri il progetto ?</span>';
  stack.querySelector('.stack-stage').appendChild(stackLink);
  const cursor = document.createElement('div');
  cursor.className = 'project-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.textContent = 'Scopri ?';
  document.body.appendChild(cursor);
  document.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionDisabled()) return;
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    cursor.classList.toggle('active', Boolean(event.target.closest('.scene-card, .work-tile, .stack-project-link')));
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('active'));
  document.addEventListener('scroll', () => cursor.classList.remove('active'), { passive: true });
  heroPreview?.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionDisabled()) return;
    const rect = heroPreview.getBoundingClientRect();
    heroPreview.style.setProperty('--tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -12}deg`);
    heroPreview.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 12}deg`);
  });
  heroPreview?.addEventListener('pointerleave', () => {
    heroPreview.style.setProperty('--tilt-x', '0deg');
    heroPreview.style.setProperty('--tilt-y', '0deg');
  });
  document.querySelectorAll('.title-line > span').forEach(line => {
    const text = line.firstChild;
    if (text.nodeType !== Node.TEXT_NODE) return;
    const fragment = document.createDocumentFragment();
    [...text.textContent].forEach((letter, index) => {
      const character = document.createElement('span');
      character.className = 'title-character';
      character.textContent = letter;
      character.style.setProperty('--character-delay', `${index * 55}ms`);
      fragment.appendChild(character);
    });
    line.replaceChild(fragment, text);
  });
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);
  let scheduled = false;
  function drawScroll() {
    scheduled = false;
    if (motionDisabled()) return;
    const height = window.innerHeight;
    const width = window.innerWidth;
    const heroRect = heroSection.getBoundingClientRect();
    if (heroRect.bottom > 0) {
      const progress = clamp(-heroRect.top / height);
      hero.style.transform = `translateY(${progress * height * .22}px) scale(${1 - progress * .08})`;
      hero.style.opacity = String(1 - progress * .8);
    }
    const stackRect = stack.getBoundingClientRect();
    if (stackRect.top < height && stackRect.bottom > 0) {
      const progress = clamp(-stackRect.top / Math.max(1, stackRect.height - height));
      const fan = ease(clamp(progress / .4));
      const expansion = ease(clamp((progress - .35) / .5));
      const spread = fan * Math.min(width * .2, 300) * (1 - expansion);
      stackBack.style.transform = `translate(${-spread - expansion * width * .4}px, ${-fan * 40}px) rotate(${-14 - fan * 18}deg) scale(${1 - expansion * .2})`;
      stackBack.style.opacity = String(1 - expansion);
      const portraitWidth = width <= 760 ? 190 : Math.min(310, Math.max(180, width * .2));
      const targetWidth = Math.min(width * .85, 780);
      const targetHeight = Math.min(targetWidth * .625, height * .58);
      stackFront.style.width = `${mix(portraitWidth, targetWidth, expansion)}px`;
      stackFront.style.height = `${mix(portraitWidth * 1.5, targetHeight, expansion)}px`;
      stackFront.style.transform = `translate(${(30 + spread) * (1 - expansion)}px, ${25 * (1 - expansion)}px) rotate(${12 * (1 - expansion)}deg)`;
      stackLines.forEach((line, index) => {
        line.style.transform = `translateX(${(index % 2 ? -1 : 1) * progress * 300}px)`;
        line.style.opacity = String(1 - expansion * .6);
      });
      stackLink.style.opacity = String(clamp((progress - .7) / .15));
      stackLink.style.visibility = progress > .7 ? 'visible' : 'hidden';
      stack.querySelector('.stack-caption').style.opacity = String(1 - expansion);
    }
    scenes.forEach(scene => {
      const rect = scene.getBoundingClientRect();
      if (rect.top >= height || rect.bottom <= 0) return;
      const progress = clamp(-rect.top / Math.max(1, rect.height - height));
      const arrival = ease(clamp((height - rect.top) / height));
      const card = scene.querySelector('.scene-card');
      card.style.setProperty('--scroll-y', `${mix(140, -65, progress)}px`);
      card.style.setProperty('--scroll-rotation', `${mix(12, -4, progress)}deg`);
      card.style.setProperty('--scroll-scale', String(mix(.72, 1.08, ease(progress))));
      scene.querySelector('.scene-background').style.transform = `scale(${mix(1.15, 1, progress)})`;
      scene.querySelector('.scene-marquee').style.transform = `translateX(${-progress * width * .28}px)`;
      card.style.opacity = String(arrival);
    });
    const contactRect = contact.getBoundingClientRect();
    if (contactRect.top < height && contactRect.bottom > 0) {
      const progress = clamp(-contactRect.top / Math.max(1, contactRect.height - height));
      const inset = 1 - ease(progress);
      contactImage.style.clipPath = `inset(${24 * inset}% ${30 * inset}% round ${24 * inset}px)`;
      document.querySelector('.contact-content').style.transform = `translateY(${(1 - progress) * 60}px)`;
    }
  }
  function scheduleScroll() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(drawScroll); }
  }
  function resetMotion() {
    root.classList.toggle('motion-ready', !motionDisabled());
    root.classList.toggle('motion-opt-in', motionOverride);
    root.classList.toggle('motion-off', !motionOverride);
    motionToggle.hidden = false;
    motionToggle.setAttribute('aria-pressed', String(motionOverride));
    motionToggle.textContent = motionOverride ? 'Riduci animazioni' : 'Attiva animazioni';
    [hero, heroPreview, stackFront, stackBack, stackLink, ...stackLines,
      stack.querySelector('.stack-caption'), contactImage, document.querySelector('.contact-content'),
      ...scenes.flatMap(scene => [...scene.querySelectorAll('.scene-card, .scene-background, .scene-marquee')])
    ].filter(Boolean).forEach(element => element.removeAttribute('style'));
    cursor.classList.remove('active');
    scheduleScroll();
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll);
  motionToggle.addEventListener('click', () => {
    motionOverride = !motionOverride;
    try { localStorage.setItem('bypat-plinth-motion', motionOverride ? 'full' : 'reduced'); } catch { /* Keep the choice for this visit when storage is unavailable. */ }
    resetMotion();
  });
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', resetMotion);
  else reducedMotion.addListener(resetMotion);
  resetMotion();
})();
