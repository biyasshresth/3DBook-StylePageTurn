export interface BookPage {
  id: number;
  title: string;
  component: string;
}

export const BOOK_PAGES: BookPage[] = [
  { id: 0, title: 'Cover', component: 'cover' },
  { id: 1, title: 'About', component: 'about' },
  { id: 2, title: 'Projects', component: 'projects' },
  { id: 3, title: 'Services', component: 'services' },
  { id: 4, title: 'Contact', component: 'contact' },
];
