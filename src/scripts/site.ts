export function initSite() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector<HTMLElement>('.nav-links');
  const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const closeMenu = () => { nav?.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; nav?.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); });
  nav?.addEventListener('click', e => { if ((e.target as Element).closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!(e.target as Element).closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
  matchMedia(document.documentElement.lang === 'en' ? '(max-width:1399px)' : '(max-width:1199px)').addEventListener('change', closeMenu);

  const panels = [...document.querySelectorAll<HTMLElement>('[data-story-panel]')];
  const storyLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-story-link]')];
  const navigatorHints = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const constrained = !!navigatorHints.connection?.saveData || (navigatorHints.deviceMemory !== undefined && navigatorHints.deviceMemory < 4) || (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4);
  // Native document flow and anchors preserve wheel, touch, history and keyboard
  // behaviour. Observers only update navigation; they never move the viewport.
  if ('IntersectionObserver' in window) {
    const visible = new Set<HTMLElement>();
    const chapters = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target as HTMLElement) : visible.delete(entry.target as HTMLElement));
      const current = panels.find(panel => visible.has(panel));
      storyLinks.forEach(link => {
        if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -50% 0px' });
    panels.forEach(panel => chapters.observe(panel));
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

  document.querySelectorAll<HTMLElement>('[data-promo-player]').forEach(player => {
    const video = player.querySelector<HTMLVideoElement>('[data-promo-video]');
    const launch = player.querySelector<HTMLButtonElement>('[data-video-play]');
    const label = player.querySelector<HTMLElement>('[data-video-play-label]');
    const error = player.parentElement?.querySelector<HTMLElement>('[data-video-error]');
    if (!video || !launch) return;
    video.controls = false;
    launch.hidden = false;
    let keyboardLaunch = false;
    let attempt = 0, loadingTimer: number | undefined;
    const clearLoadingTimer = () => { clearTimeout(loadingTimer); loadingTimer = undefined; };
    const resetLaunch = () => { launch.disabled = false; launch.removeAttribute('aria-busy'); if (label) label.textContent = player.dataset.playLabel ?? ''; };
    const showFailure = () => {
      clearLoadingTimer(); keyboardLaunch = false; video.pause(); video.controls = false;
      launch.hidden = false; resetLaunch(); if (error) error.hidden = false;
    };
    launch.addEventListener('click', event => {
      const currentAttempt = ++attempt;
      keyboardLaunch = event.detail === 0;
      launch.disabled = true; launch.setAttribute('aria-busy', 'true');
      if (label) label.textContent = player.dataset.loadingLabel ?? '';
      if (error) error.hidden = true;
      if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) video.load();
      video.controls = true;
      clearLoadingTimer(); loadingTimer = window.setTimeout(() => { if (currentAttempt === attempt) showFailure(); }, 20000);
      // Call play during the gesture, preserving mobile playback with sound.
      void video.play().catch(() => { if (currentAttempt === attempt) showFailure(); });
    });
    video.addEventListener('playing', () => {
      clearLoadingTimer();
      const restoreFocus = keyboardLaunch;
      keyboardLaunch = false;
      launch.hidden = true; resetLaunch(); if (error) error.hidden = true;
      if (restoreFocus) video.focus({ preventScroll: true });
    });
    video.addEventListener('error', showFailure);
    video.querySelector('source')?.addEventListener('error', showFailure);
    const pause = () => { if (!video.paused) video.pause(); };
    if ('IntersectionObserver' in window) {
      const visibility = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }, { threshold: 0 });
      visibility.observe(video);
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    addEventListener('pagehide', pause);
  });

  if (!reduced.matches && 'IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); reveal.unobserve(entry.target); } }); }, { threshold: .08 });
    document.querySelectorAll('[data-reveal]').forEach(node => reveal.observe(node)); document.documentElement.classList.add('has-reveals');
  }
  const hero = document.querySelector<HTMLElement>('[data-hero-device]');
  if (hero && !reduced.matches && !constrained && matchMedia('(min-width:1024px)').matches) {
    const start = () => {
      if (hero.getBoundingClientRect().bottom < 0 || reduced.matches || document.hidden) return;
      void import('./brand-scene').then(module => module.startBrandScene(hero)).catch(() => { /* The static brand poster is the complete fallback. */ });
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 1800 }); else setTimeout(start, 600);
  }
}
