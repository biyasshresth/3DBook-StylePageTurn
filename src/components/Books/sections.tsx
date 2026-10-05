export interface SectionProps {
  onNavigate(index: number): void;
}

const PROJECTS = [
  { name: 'Folio Maritime', meta: 'Archive · 2026' },
  { name: 'Hearth & Loom', meta: 'Commerce · 2025' },
  { name: 'Northlight Press', meta: 'Editorial · 2024' },
  { name: 'Quiet Ledger', meta: 'Fintech · 2023' },
];

const SERVICES = [
  { name: 'Brand & Identity', meta: 'I' },
  { name: 'Digital Product Design', meta: 'II' },
  { name: 'Creative Engineering', meta: 'III' },
  { name: 'Motion & 3D', meta: 'IV' },
];

function IndexList({ items }: { items: { name: string; meta: string }[] }) {
  return (
    <ol className="index-list">
      {items.map((item) => (
        <li key={item.name}>
          <span className="index-list__name">{item.name}</span>
          <span className="index-list__dots" aria-hidden="true" />
          <span className="index-list__meta">{item.meta}</span>
        </li>
      ))}
    </ol>
  );
}

export function CoverSection({ onNavigate }: SectionProps) {
  return (
    <>
      <p className="lede">
        We design interfaces with the patience of a bookbinder — grain, weight, and the quiet pleasure of a page that
        turns as it should.
      </p>
      <button type="button" className="ink-button" onClick={() => onNavigate(1)}>Turn the page</button>
    </>
  );
}

export function AboutSection(_: SectionProps) {
  return (
    <>
      <p className="lede">
        A small atelier of designers and engineers crafting digital objects that feel made, not manufactured.
      </p>
      <dl className="stats">
        <div><dt>Years</dt><dd>12</dd></div>
        <div><dt>Works</dt><dd>140</dd></div>
        <div><dt>Awards</dt><dd>9</dd></div>
      </dl>
    </>
  );
}

export function ProjectsSection(_: SectionProps) {
  return (
    <>
      <p className="lede lede--small secondary">A few leaves from our recent catalogue.</p>
      <IndexList items={PROJECTS} />
    </>
  );
}

export function ServicesSection(_: SectionProps) {
  return (
    <>
      <p className="lede lede--small secondary">Every engagement is bound by hand, end to end.</p>
      <IndexList items={SERVICES} />
    </>
  );
}

export function ContactSection({ onNavigate }: SectionProps) {
  return (
    <>
      <p className="lede lede--small secondary">New commissions open for the winter season.</p>
      <a className="contact-mail" href="mailto:hello@ateliervellum.studio">hello@ateliervellum.studio</a>
      <p className="contact-meta">Lisbon · London · Remote</p>
      <button type="button" className="ink-button" onClick={() => onNavigate(0)}>Back to the first leaf</button>
    </>
  );
}
