import type { BookPage } from '../../data/pages';

interface PageNavigationProps {
  pages: BookPage[];
  current: number;
  onSelect(index: number): void;
}

export function PageNavigation({ pages, current, onSelect }: PageNavigationProps) {
  return (
    <nav className="page-nav" aria-label="Book chapters">
      <span className="page-nav__brand" aria-hidden="true">AV</span>
      <ol className="page-nav__list">
        {pages.map((page, index) => {
          const active = index === current;
          return (
            <li key={page.id}>
              <button
                type="button"
                className={`page-nav__item${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelect(index)}
              >
                <span className="page-nav__index">{String(index).padStart(2, '0')}</span>
                <span className="page-nav__label">{page.title}</span>
                <span className="page-nav__line" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
