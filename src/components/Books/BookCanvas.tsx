import type { ReactNode, RefObject } from 'react';

interface BookCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  overlayRef: RefObject<HTMLDivElement>;
  children: ReactNode;
}

export function BookCanvas({ canvasRef, overlayRef, children }: BookCanvasProps) {
  return (
    <div className="book-stage">
      <canvas ref={canvasRef} className="book-canvas" aria-hidden="true" />
      <div ref={overlayRef} className="book-overlay">
        {children}
      </div>
    </div>
  );
}
