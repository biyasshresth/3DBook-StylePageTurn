interface CoverFaceProps {
  hidden: boolean;
  disabled: boolean;
  onOpen(): void;
}

export function CoverFace({ hidden, disabled, onOpen }: CoverFaceProps) {
  return (
    <div className={`cover-face${hidden ? ' is-hidden' : ''}`} aria-hidden={hidden}>
      <h1 className="sr-only">Open the book to explore Atelier Vellum</h1>
      <button type="button" className="cover-button" onClick={onOpen} disabled={disabled} tabIndex={hidden ? -1 : 0}>
        <span className="cover-button__label">Open the Book</span>
        <span className="cover-button__disc" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="40%" height="40%" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
            <path d="M5 17a3 3 0 0 1 3-3h11" />
            <path d="M9 8h6" />
          </svg>
        </span>
      </button>
    </div>
  );
}
