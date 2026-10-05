import type { ReactNode } from 'react';

interface LeafProps {
  side: 'left' | 'right';
  folio?: string;
  children?: ReactNode;
}

/** A single physical leaf of the HTML content layer. */
export function Leaf({ side, folio, children }: LeafProps) {
  return (
    <div className={`leaf leaf--${side}`}>
      <div className="leaf__inner">{children}</div>
      {folio ? <span className="leaf__folio">{folio}</span> : null}
    </div>
  );
}
