interface BookControlsProps {
  enabled: boolean;
  canPrevious: boolean;
  canNext: boolean;
  showHint: boolean;
  onPrevious(): void;
  onNext(): void;
}

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export function BookControls({ enabled, canPrevious, canNext, showHint, onPrevious, onNext }: BookControlsProps) {
  return (
    <div className="book-controls">
      <span className={`scroll-hint${showHint ? ' is-visible' : ''}`} aria-hidden="true">Scroll to turn</span>
      <button type="button" className="round-button" aria-label="Previous page" onClick={onPrevious} disabled={!enabled || !canPrevious}>
        <Chevron flip />
      </button>
      <button type="button" className="round-button" aria-label="Next page" onClick={onNext} disabled={!enabled || !canNext}>
        <Chevron />
      </button>
    </div>
  );
}
