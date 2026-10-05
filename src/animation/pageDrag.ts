import type { ScrollDriver } from './scrollDriver';

const INTERACTIVE = 'a,button,input,textarea,select,label';

export function bindPageDrag(el: HTMLElement, driver: ScrollDriver): () => void {
  let id = -1;
  let x0 = 0;
  let y0 = 0;
  let active = false;

  const down = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
    id = e.pointerId;
    x0 = e.clientX;
    y0 = e.clientY;
    active = false;
  };

  const move = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - x0;
    if (!active) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - y0)) return;
      if (!driver.beginDrag()) { id = -1; return; }
      active = true;
      el.setPointerCapture(id);
    }
    const pageWidth = Math.max(1, el.getBoundingClientRect().width / 2);
    driver.drag(-dx / (pageWidth * 1.1));
  };

  const up = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    if (active) driver.endDrag();
    if (el.hasPointerCapture(id)) el.releasePointerCapture(id);
    id = -1;
    active = false;
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
  };
}
