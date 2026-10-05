export interface PageCopy {
  kicker: string;
  heading: string;
  numeral: string;
  leafTitle: string;
  epigraph: string;
}

export const PAGE_COPY: Record<string, PageCopy> = {
  cover: { kicker: 'Atelier Vellum · Est. 2014', heading: 'A studio bound in five leaves', numeral: '', leafTitle: '', epigraph: '' },
  about: { kicker: 'Chapter One', heading: 'Made slowly, on purpose', numeral: 'I', leafTitle: 'About', epigraph: '“Every interface is a book someone chooses to read.”' },
  projects: { kicker: 'Chapter Two', heading: 'Selected works', numeral: 'II', leafTitle: 'Projects', epigraph: '“The work is the only argument worth making.”' },
  services: { kicker: 'Chapter Three', heading: 'What we bind together', numeral: 'III', leafTitle: 'Services', epigraph: '“Form follows patience.”' },
  contact: { kicker: 'Chapter Four', heading: 'Write us a letter', numeral: 'IV', leafTitle: 'Contact', epigraph: '“All good books end with an invitation.”' },
};
