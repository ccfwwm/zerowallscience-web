export function initSite() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector<HTMLElement>('.nav-links');
  const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const closeMenu = () => { nav?.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; nav?.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); });
  nav?.addEventListener('click', e => { if ((e.target as Element).closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!(e.target as Element).closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
  matchMedia('(max-width:1199px)').addEventListener('change', closeMenu);

  const story = document.querySelector<HTMLElement>('[data-story]');
  const panels = [...document.querySelectorAll<HTMLElement>('[data-story-panel]')];
  const storyLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-story-link]')];
  const desktop = matchMedia('(min-width:1200px) and (min-height:780px)');
  const navigatorHints = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const constrained = !!navigatorHints.connection?.saveData || (navigatorHints.deviceMemory !== undefined && navigatorHints.deviceMemory < 4) || (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4);
  let enhanced = false, active = -1, queued = false;
  const selectChapter = (index: number) => {
    if (index === active) return; active = index;
    panels.forEach((panel, i) => { panel.classList.toggle('is-current', i === index); panel.classList.toggle('is-past', i < index); panel.inert = i !== index; panel.setAttribute('aria-hidden', String(i !== index)); });
    storyLinks.forEach(link => { if (Number(link.dataset.storyLink) === index) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current'); });
  };
  const update = () => {
    queued = false; if (!enhanced || !story) return;
    const rect = story.getBoundingClientRect();
    const progress = Math.max(0, Math.min(.9999, -rect.top / (story.offsetHeight - innerHeight)));
    selectChapter(Math.floor(progress * panels.length));
    panels[active].dataset.phase = String(Math.floor((progress * panels.length % 1) * 4));
  };
  const configure = () => {
    if (!story) return;
    enhanced = desktop.matches && !reduced.matches && !constrained;
    story.classList.toggle('story-enhanced', enhanced); active = -1;
    if (enhanced) update(); else { panels.forEach(panel => { panel.inert = false; panel.removeAttribute('aria-hidden'); panel.classList.remove('is-current', 'is-past'); }); storyLinks.forEach(link => link.removeAttribute('aria-current')); }
  };
  const goToChapter = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!story || !panels[index]) return;
    if (enhanced) {
      const top = story.getBoundingClientRect().top + scrollY;
      const span = story.offsetHeight - innerHeight;
      scrollTo({ top: top + span * (index + .18) / panels.length, behavior: reduced.matches ? 'instant' : behavior });
    } else panels[index].scrollIntoView({ behavior: reduced.matches ? 'instant' : behavior, block: 'start' });
  };
  storyLinks.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); const index = Number(link.dataset.storyLink);
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    closeMenu(); goToChapter(index);
  }));
  // A visitor can use the demo as soon as it appears during a smooth chapter jump.
  // Stop that jump on interaction so the stage cannot move away under their pointer.
  story?.addEventListener('pointerdown', event => {
    if (enhanced && (event.target as Element).closest('.feature-visual button, .feature-visual a, [data-object], summary')) {
      scrollTo({ top: scrollY, behavior: 'instant' });
    }
  });
  const followHash = () => { const index = panels.findIndex(panel => `#${panel.id}` === location.hash); if (index >= 0) goToChapter(index, 'instant'); };
  addEventListener('scroll', () => { if (enhanced && !queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', () => { configure(); closeMenu(); }, { passive: true });
  addEventListener('popstate', followHash); addEventListener('hashchange', followHash);
  desktop.addEventListener('change', configure); reduced.addEventListener('change', configure); configure();
  if (location.hash) {
    requestAnimationFrame(followHash);
    // Browser-native initial hash scrolling can run after deferred scripts.
    if (document.readyState !== 'complete') addEventListener('load', () => requestAnimationFrame(followHash), { once: true });
  }

  function tabs(container: Element, buttonSelector: string, panelSelector: string) {
    const buttons = [...container.querySelectorAll<HTMLButtonElement>(buttonSelector)];
    const items = [...container.querySelectorAll<HTMLElement>(panelSelector)];
    const select = (index: number) => { buttons.forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; }); items.forEach((item, i) => { item.hidden = i !== index; }); };
    buttons.forEach((button, i) => {
      button.addEventListener('click', () => select(i));
      button.addEventListener('keydown', event => { let next = i; if (event.key === 'ArrowRight') next = (i + 1) % buttons.length; else if (event.key === 'ArrowLeft') next = (i - 1 + buttons.length) % buttons.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = buttons.length - 1; else return; event.preventDefault(); select(next); buttons[next].focus({ preventScroll: true }); });
    }); select(0);
  }
  document.querySelectorAll('[data-medical]').forEach(container => tabs(container, '[data-medical-tab]', '[data-medical-panel]'));
  document.querySelectorAll('[data-ppt]').forEach(container => {
    tabs(container, '[data-ppt-page]', '[data-ppt-panel]');
    const description = container.querySelector<HTMLElement>('[data-object-description]');
    const modeButtons = [...container.querySelectorAll<HTMLButtonElement>('[data-ppt-mode]')];
    modeButtons.forEach(button => button.addEventListener('click', () => { const objects = button.dataset.pptMode === 'objects'; container.classList.toggle('show-objects', objects); modeButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button))); if (description) description.textContent = description.dataset.defaultDescription ?? ''; }));
    const selectObject = (target: HTMLElement) => { container.classList.add('show-objects'); modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pptMode === 'objects'))); container.querySelectorAll('.is-selected').forEach(node => node.classList.remove('is-selected')); target.classList.add('is-selected'); if (description) description.textContent = target.getAttribute('aria-label') || target.dataset.object || ''; };
    container.querySelectorAll<HTMLElement>('[data-object]').forEach(target => { target.addEventListener('click', () => selectObject(target)); target.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectObject(target); } }); });
  });

  const dialog = document.querySelector<HTMLDialogElement>('.image-dialog');
  let previousFocus: HTMLElement | null = null;
  document.querySelectorAll<HTMLAnchorElement>('[data-zoom]').forEach(link => link.addEventListener('click', event => {
    if (!dialog || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); previousFocus = link;
    const image = dialog.querySelector<HTMLImageElement>('[data-dialog-image]')!;
    const label = link.dataset.zoomLabel ?? ''; image.src = link.href; image.alt = label;
    dialog.classList.toggle('is-qr', link.dataset.zoomKind === 'qr');
    if (label) dialog.setAttribute('aria-label', label);
    dialog.querySelector('[data-image-caption]')!.textContent = label; dialog.showModal();
  }));
  dialog?.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog?.addEventListener('close', () => previousFocus?.focus({ preventScroll: true }));

  if (!reduced.matches && 'IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); reveal.unobserve(entry.target); } }); }, { threshold: .08 });
    document.querySelectorAll('[data-reveal]').forEach(node => reveal.observe(node)); document.documentElement.classList.add('has-reveals');
  }
  const hero = document.querySelector<HTMLElement>('[data-hero-device]');
  if (hero && !reduced.matches && !constrained && matchMedia('(min-width:1024px)').matches) {
    const start = () => import('./brand-scene').then(module => module.startBrandScene(hero)).catch(() => { /* The static brand poster is the complete fallback. */ });
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 1800 }); else setTimeout(start, 600);
  }
}
