import { animate, inView, scroll } from 'motion';

export function initMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const cleanups: Array<() => void> = [];
  const animations: Array<ReturnType<typeof animate>> = [];
  cleanups.push(inView('[data-reveal]', element => {
    animations.push(animate(element, { opacity: [0, 1], y: [12, 0] }, { duration: .32, ease: [.22, 1, .36, 1] }));
  }, { amount: .08 }));

  // The indicator follows native scrolling; content is never pinned or hidden.
  const line = document.querySelector<HTMLElement>('[data-workflow-progress]');
  const workflow = document.querySelector<HTMLElement>('.workflow-path');
  const narrow = matchMedia('(max-width: 767px)');
  let stopProgress: (() => void) | undefined;
  const bindProgress = () => {
    stopProgress?.();
    if (!line || !workflow) return;
    line.style.transform = '';
    const animation = animate(line, narrow.matches ? { scaleY: [0, 1], scaleX: 1 } : { scaleX: [0, 1], scaleY: 1 }, { ease: 'linear' });
    animations.push(animation);
    stopProgress = scroll(animation, { target: workflow, offset: ['start 90%', 'end 45%'] });
  };
  bindProgress();
  narrow.addEventListener('change', bindProgress);

  // One moving plate makes the source and destination of a tab change clear.
  document.querySelectorAll<HTMLElement>('.visual-tabs').forEach(tabs => {
    const plate = document.createElement('span');
    plate.className = 'tab-indicator';
    plate.setAttribute('aria-hidden', 'true');
    tabs.prepend(plate);
    const position = (immediate = false) => {
      const active = tabs.querySelector<HTMLElement>('[aria-selected="true"], [aria-pressed="true"]');
      if (!active) return;
      const target = { x: active.offsetLeft, y: active.offsetTop, width: active.offsetWidth, height: active.offsetHeight };
      if (immediate) Object.assign(plate.style, { transform: `translate(${target.x}px, ${target.y}px)`, width: `${target.width}px`, height: `${target.height}px` });
      else animations.push(animate(plate, target, { duration: .22, ease: [.22, 1, .36, 1] }));
    };
    position(true);
    tabs.classList.add('has-indicator');
    const observer = new MutationObserver(() => position());
    observer.observe(tabs, { subtree: true, attributes: true, attributeFilter: ['aria-selected', 'aria-pressed'] });
    const resize = new ResizeObserver(() => position(true));
    resize.observe(tabs);
    cleanups.push(() => { observer.disconnect(); resize.disconnect(); plate.remove(); tabs.classList.remove('has-indicator'); });
  });
  const dispose = () => {
    cleanups.forEach(stop => stop());
    stopProgress?.();
    animations.forEach(animation => animation.cancel());
    if (line) line.style.transform = '';
    narrow.removeEventListener('change', bindProgress);
    reduced.removeEventListener('change', dispose);
  };
  reduced.addEventListener('change', dispose, { once: true });
}
