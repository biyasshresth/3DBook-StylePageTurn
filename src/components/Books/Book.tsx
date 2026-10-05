import { useRef } from "react";

import { BookCanvas } from "./BookCanvas";
import { BookControls } from "./BookControls";
import { PageContent } from "./PageContent";
import { PageNavigation } from "../Navigation/PageNavigation";

import { useBook } from "../../hooks/useBook";
import { usePageNavigation } from "../../hooks/usePageNavigation";

import { BOOK_PAGES } from "../../data/pages";

export function Book() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const overlayRef = useRef<HTMLDivElement>(null!);

  const book = useBook(canvasRef, overlayRef);

  const isOpen = book.state === "OPEN";

  usePageNavigation(
    book.driverRef,
    overlayRef,
    isOpen,
  );

  const activePage = isOpen
    ? book.displayPage
    : book.page;

  return (
    <main
      className="book-app"
      data-state={book.state.toLowerCase()}
      data-ready={book.ready}
    >
      <PageNavigation
        pages={BOOK_PAGES}
        current={isOpen ? activePage : -1}
        onSelect={book.goToPage}
      />

      <BookCanvas
        canvasRef={canvasRef}
        overlayRef={overlayRef}
      >
        <PageContent
          state={book.state}
          page={activePage}
          ready={book.ready}
          onOpen={() => void book.openBook()}
          onNavigate={book.goToPage}
        />
      </BookCanvas>

      <BookControls
        enabled={isOpen}
        canPrevious={activePage > 0}
        canNext={
          activePage < BOOK_PAGES.length - 1
        }
        onPrevious={book.previousPage}
        onNext={book.nextPage}
        showHint={isOpen && activePage === 0}
      />
    </main>
  );
}
