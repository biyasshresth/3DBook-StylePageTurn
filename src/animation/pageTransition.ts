import gsap from 'gsap';

export interface BookOpening {
  finished: Promise<void>;
  kill(): void;
}

export function playBookOpening(onUpdate: (progress: number) => void, duration = 2.4): BookOpening {
  const proxy = { p: 0 };
  let tween: gsap.core.Tween | null = null;
  const finished = new Promise<void>((resolve) => {
    tween = gsap.to(proxy, {
      p: 1,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => onUpdate(proxy.p),
      onComplete: resolve,
    });
  });
  return { finished, kill: () => tween?.kill() };
}
