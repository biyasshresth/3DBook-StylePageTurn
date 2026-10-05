import { useEffect, type MutableRefObject, type RefObject } from 'react';
import type { ScrollDriver } from '../animation/scrollDriver';
import { bindPageDrag } from '../animation/pageDrag';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Binds wheel, touch, keyboard and drag input — only while the book is OPEN. */
export function usePageNavigation(
  driverRef: MutableRefObject<ScrollDriver | null>,
  overlayRef: RefObject<HTMLElement>,
  active: boolean,
): void {
  useEffect(() => {
    const driver = driverRef.current;
    const overlay = overlayRef.current;
    if (!active || !driver || !overlay) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      driver.scroll(clamp(delta * unit, -160, 160));
    };

    let lastY = 0;
    let startX = 0;
    let startY = 0;
    let axis: 'x' | 'y' | null = null;
    const onTouchStart = (e: TouchEvent) => {
      lastY = startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      axis = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!axis && Math.hypot(t.clientX - startX, t.clientY - startY) > 8) {
        axis = Math.abs(t.clientY - startY) > Math.abs(t.clientX - startX) ? 'y' : 'x';
      }
      if (e.cancelable) e.preventDefault();
      if (axis === 'y') driver.scroll((lastY - t.clientY) * 2.4);
      lastY = t.clientY;
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea')) return;
      const forward = ['ArrowDown', 'ArrowRight', 'PageDown', ' '];
      const backward = ['ArrowUp', 'ArrowLeft', 'PageUp'];
      if (forward.includes(e.key)) driver.step(1);
      else if (backward.includes(e.key)) driver.step(-1);
      else if (e.key === 'Home') driver.goTo(0);
      else if (e.key === 'End') driver.goTo(Number.MAX_SAFE_INTEGER);
      else return;
      e.preventDefault();
    };

    const unbindDrag = bindPageDrag(overlay, driver);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      unbindDrag();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [active, driverRef, overlayRef]);
}
