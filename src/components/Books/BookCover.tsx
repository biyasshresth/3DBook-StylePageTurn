import type { BookState } from "../../hooks/useBook";

 
interface BookCoverProps {
  state: BookState;
  onOpen: () => void;
}

/** Closed-state content layer: embossed title + the "Open the Book" entry point. */
export function BookCover({ state, onOpen }: BookCoverProps) {
  const closed = state === 'CLOSED';

  return (
    <div className="cover-layer" data-state={state.toLowerCase()} aria-hidden={!closed}>
      <div className="cover-layer__plate">
        <h1 className="cover-layer__title">
          Open
          <br /> The Book
          <br /> To Explore
        </h1>

        <button
          type="button"
          className="cover-layer__button"
          onClick={onOpen}
          disabled={!closed}
          aria-label="Open the book"
        >
          <span className="cover-layer__label">Explore</span>
          <span className="cover-layer__seal">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="4.5" y="4.5" width="15" height="15" rx="1" />
              <path d="M8 9h8M8 12h8M8 15h5" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
