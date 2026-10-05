import gsap from "gsap";

const SCROLL_PER_PAGE = 360;
const SCROLL_SETTLE_THRESHOLD = 0.12;
const DAMPING = 0.14;
const COOLDOWN_MS = 420;

const clamp = (v: number, a: number, b: number): number =>
  Math.min(b, Math.max(a, v));

export interface DriverEvents {
  onProgress(position: number): void;
  onCommit(index: number): void;
  onDisplayPage?(index: number): void;
}

export class ScrollDriver {
  enabled = false;
  pos = 0;

  private target = 0;
  private committed = 0;
  private dragBase = 0;

  private tween: gsap.core.Tween | null = null;
  private settleTimer = 0;
  private cooldownUntil = 0;
  private lastEmitted = -1;

  private displayPage = 0;
  private displayTarget = -1;

  private readonly last: number;
  private readonly events: DriverEvents;

  constructor(last: number, events: DriverEvents) {
    this.last = last;
    this.events = events;

    gsap.ticker.add(this.tick);
  }

  get current(): number {
    return this.committed;
  }
  get displayed(): number {
  return this.displayPage;
}

  scroll(deltaPx: number): void {
    if (
      !this.enabled ||
      this.tween ||
      performance.now() < this.cooldownUntil
    ) {
      return;
    }

    this.setTarget(this.target + deltaPx / SCROLL_PER_PAGE);
    this.setAdjacentDisplayTarget();

    window.clearTimeout(this.settleTimer);

    this.settleTimer = window.setTimeout(() => {
      this.settle(SCROLL_SETTLE_THRESHOLD);
    }, 150);
  }

  beginDrag(): boolean {
    if (!this.enabled || this.tween) {
      return false;
    }

    window.clearTimeout(this.settleTimer);

    this.dragBase = this.committed;
    this.displayTarget = -1;
    this.updateDisplayPage();

    return true;
  }

  drag(offset: number): void {
    if (this.enabled && !this.tween) {
      this.setTarget(this.dragBase + offset);
      this.setAdjacentDisplayTarget();
    }
  }

  endDrag(): void {
    this.settle(0.5);
  }

  step(direction: number): void {
    this.goTo(
      (this.tween ? this.target : this.committed) + direction,
    );
  }

  goTo(index: number): void {
    if (!this.enabled) {
      return;
    }

    const i = clamp(Math.round(index), 0, this.last);

    window.clearTimeout(this.settleTimer);

    this.tween?.kill();

    const distance = Math.abs(i - this.pos);

    if (distance < 1e-4) {
      this.tween = null;
      this.displayPage = i;
      this.displayTarget = -1;

      this.commit(i);
      return;
    }

    this.target = i;
    this.displayTarget = i;

    this.tween = gsap.to(this, {
      pos: i,
      duration: 0.95 + 0.6 * Math.max(0, distance - 1),
      ease: "power2.inOut",

      onUpdate: () => {
        this.emit();
        this.updateDisplayPage();
      },

      onComplete: () => {
        this.tween = null;

        this.displayPage = i;
        this.displayTarget = -1;

        this.commit(i);
      },
    });
  }

  dispose(): void {
    gsap.ticker.remove(this.tick);

    this.tween?.kill();
    this.tween = null;

    window.clearTimeout(this.settleTimer);
  }

  private setTarget(value: number): void {
    this.target = clamp(
      value,
      Math.max(0, this.committed - 1),
      Math.min(this.last, this.committed + 1),
    );
  }

  private setAdjacentDisplayTarget(): void {
    this.displayTarget =
      this.target > this.committed
        ? Math.min(this.last, this.committed + 1)
        : this.target < this.committed
          ? Math.max(0, this.committed - 1)
          : -1;

    this.updateDisplayPage();
  }

  private settle(threshold: number): void {
    const d = this.target - this.committed;

    this.setTarget(
      d > threshold
        ? this.committed + 1
        : d < -threshold
          ? this.committed - 1
          : this.committed,
    );
    this.setAdjacentDisplayTarget();
  }

  private updateDisplayPage(): void {
    const destination = this.displayTarget;

    if (destination < 0 || destination === this.committed) {
      this.showDisplayPage(this.committed);
      return;
    }

    const distance = destination - this.committed;
    const totalDistance = Math.abs(distance);
    const travelled = Math.abs(this.pos - this.committed);
    const progress = travelled / totalDistance;

    if (progress < 0.5) {
      this.showDisplayPage(this.committed);
      return;
    }

    this.showDisplayPage(destination);
  }

  private showDisplayPage(index: number): void {
    if (this.displayPage === index) {
      return;
    }

    this.displayPage = index;
    this.events.onDisplayPage?.(index);
  }

  private readonly tick = (): void => {
    if (this.tween) {
      return;
    }

    const diff = this.target - this.pos;

    if (Math.abs(diff) < 4e-4) {
      this.pos = this.target;
    } else {
      this.pos +=
        diff *
        (1 -
          Math.pow(
            1 - DAMPING,
            gsap.ticker.deltaRatio(),
          ));
    }

    this.emit();
    this.updateDisplayPage();

    if (
      this.pos === this.target &&
      Number.isInteger(this.target) &&
      this.target !== this.committed
    ) {
      this.commit(this.target);

      this.cooldownUntil =
        performance.now() + COOLDOWN_MS;
    }
  };

  private commit(index: number): void {
    this.committed = index;
    this.target = index;
    this.pos = index;
    this.displayTarget = -1;
    this.showDisplayPage(index);
    this.emit(true);
    this.events.onCommit(index);
  }

  private emit(force = false): void {
    if (!force && this.pos === this.lastEmitted) {
      return;
    }

    this.lastEmitted = this.pos;
    this.events.onProgress(this.pos);
  }
}