import gsap from 'gsap';
import type { TurnState } from '../three/types';

export class PageTurnController {
  private readonly state: TurnState = { angle: 0, curl: 0, shadow: 0, cam: 0 };
  private readonly timeline: gsap.core.Timeline;

  constructor() {
    const s = this.state;
    this.timeline = gsap
      .timeline({ paused: true })
      .to(s, { angle: Math.PI, duration: 1, ease: 'power1.inOut' }, 0)
      .to(s, { curl: 1, duration: 0.42, ease: 'sine.out' }, 0)
      .to(s, { curl: 0, duration: 0.58, ease: 'sine.inOut' }, 0.42)
      .to(s, { shadow: 1, duration: 0.45, ease: 'sine.out' }, 0)
      .to(s, { shadow: 0, duration: 0.55, ease: 'power1.in' }, 0.45)
      .to(s, { cam: 1, duration: 0.5, ease: 'sine.inOut' }, 0)
      .to(s, { cam: 0, duration: 0.5, ease: 'sine.inOut' }, 0.5);
    this.timeline.progress(0);
  }

  sample(progress: number): TurnState {
    this.timeline.progress(Math.min(1, Math.max(0, progress)));
    return this.state;
  }

  dispose(): void {
    this.timeline.kill();
  }
}
