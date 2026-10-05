import { CoverFace } from './CoverFace';
import { SECTION_COMPONENTS } from '../../app/routes';
import { BOOK_PAGES } from '../../data/pages';
import { PAGE_COPY } from '../../data/pageCopy';
import type { BookState } from '../../hooks/useBook';

interface PageContentProps {
  state: BookState;
  page: number;
  ready: boolean;
  onOpen(): void;
  onNavigate(index: number): void;
}

export function PageContent({ state, page, ready, onOpen, onNavigate }: PageContentProps) {
  const def = BOOK_PAGES[page];
  const copy = PAGE_COPY[def.component];
  const Section = SECTION_COMPONENTS[def.component];
  const open = state === 'OPEN';

  return (
    <>
      <CoverFace hidden={state !== 'CLOSED'} disabled={!ready || state !== 'CLOSED'} onOpen={onOpen} />
      <div className={`spread${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <section className="leaf leaf--left" aria-label={`${def.title} — chapter leaf`}>
          {copy.leafTitle && <h2 className="sr-only">{copy.numeral}. {copy.leafTitle}</h2>}
          {copy.epigraph && <p className="sr-only">{copy.epigraph}</p>}
        </section>
        <section className="leaf leaf--right" aria-label={def.title}>
          <header className="sr-only">
            <p>{copy.kicker}</p>
            <h2>{copy.heading}</h2>
          </header>
          <div className="leaf__body">{Section && <Section onNavigate={onNavigate} />}</div>
        </section>
      </div>
    </>
  );
}
