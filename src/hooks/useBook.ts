import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";

import { BookScene } from "../three/BookScene";
import type { ScreenRect } from "../three/types";
import { PageTurnController } from "../animation/pageTurn";
import {
  playBookOpening,
  type BookOpening,
} from "../animation/pageTransition";
import { ScrollDriver } from "../animation/scrollDriver";
import { BOOK_PAGES } from "../data/pages";

export type BookState = "CLOSED" | "OPENING" | "OPEN";

export interface BookApi {
  state: BookState;
  page: number;
  displayPage: number;
  ready: boolean;
  driverRef: MutableRefObject<ScrollDriver | null>;
  openBook(): Promise<void>;
  nextPage(): void;
  previousPage(): void;
  goToPage(index: number): void;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

async function loadFonts(): Promise<void> {
  if (!document.fonts) return;

  const faces = [
    'italic 400 64px "Newsreader"',
    '400 32px "Newsreader"',
    '500 20px "Inter"',
  ];

  await Promise.race([
    Promise.all(faces.map((f) => document.fonts.load(f))).catch(
      () => undefined,
    ),
    new Promise((resolve) => setTimeout(resolve, 2500)),
  ]);
}

function applyRect(el: HTMLElement, r: ScreenRect): void {
  el.style.setProperty("--bx", `${r.x}px`);
  el.style.setProperty("--by", `${r.y}px`);
  el.style.setProperty("--bw", `${r.width}px`);
  el.style.setProperty("--bh", `${r.height}px`);
  el.style.setProperty("--pw", `${r.width / 2}px`);
}

export function useBook(
  canvasRef: RefObject<HTMLCanvasElement>,
  overlayRef: RefObject<HTMLDivElement>,
): BookApi {
  const [state, setState] = useState<BookState>("CLOSED");
  const [page, setPage] = useState(0);
  const [displayPage, setDisplayPage] = useState(0);
  const [ready, setReady] = useState(false);

  const sceneRef = useRef<BookScene | null>(null);
  const driverRef = useRef<ScrollDriver | null>(null);
  const stateRef = useRef<BookState>("CLOSED");
  const openingRef = useRef<Promise<void> | null>(null);
  const transitionRef = useRef<BookOpening | null>(null);

  const setBookState = useCallback((next: BookState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;

    if (!canvas || !overlay) {
      return;
    }

    let disposed = false;

    const turn = new PageTurnController();
    const sample = (f: number) => turn.sample(f);

    const driver = new ScrollDriver(
      BOOK_PAGES.length - 1,
      {
        onProgress: (pos) => {
          sceneRef.current?.setPosition(pos, sample);

          const turnProgress = Math.abs(pos - driver.current);

          // Fade the old page out near the start, then ease the new page in
          // from halfway through the turn until it is almost complete.
          const fadeOut = 1 - smooth(0.015, 0.14, turnProgress);
          const fadeIn = smooth(0.5, 0.95, turnProgress);
          const alpha = Math.max(fadeOut, fadeIn);

          overlay.style.setProperty(
            "--content-alpha",
            alpha.toFixed(3),
          );
        },

        onCommit: (index) => {
          setPage(index);
          setDisplayPage(index);
        },

        onDisplayPage: (index) => {
          setDisplayPage(index);
        },
      },
    );

    driverRef.current = driver;

    const observer = new ResizeObserver(() => {
      sceneRef.current?.resize(
        canvas.clientWidth,
        canvas.clientHeight,
      );
    });

    loadFonts().then(() => {
      if (disposed) {
        return;
      }

      const scene = new BookScene(
        canvas,
        BOOK_PAGES,
      );

      scene.onRect = (r) => {
        applyRect(overlay, r);
      };

      scene.setPosition(0, sample);

      sceneRef.current = scene;

      observer.observe(canvas);

      setReady(true);
    });

    return () => {
      disposed = true;

      observer.disconnect();

      transitionRef.current?.kill();

      driver.dispose();
      turn.dispose();

      sceneRef.current?.dispose();
      sceneRef.current = null;

      driverRef.current = null;
      openingRef.current = null;

      stateRef.current = "CLOSED";
    };
  }, [canvasRef, overlayRef]);

  const openBook = useCallback((): Promise<void> => {
    if (openingRef.current) {
      return openingRef.current;
    }

    const scene = sceneRef.current;

    if (!scene || stateRef.current !== "CLOSED") {
      return Promise.resolve();
    }

    setBookState("OPENING");

    const transition = playBookOpening((p) => {
      scene.setOpen(p);
    });

    transitionRef.current = transition;

    openingRef.current = transition.finished.then(() => {
      setBookState("OPEN");

      setDisplayPage(
        driverRef.current?.current ?? 0,
      );

      if (driverRef.current) {
        driverRef.current.enabled = true;
      }
    });

    return openingRef.current;
  }, [setBookState]);

  const goToPage = useCallback(
    (index: number) => {
      const driver = driverRef.current;

      if (!driver) {
        return;
      }

      if (stateRef.current === "OPEN") {
        driver.goTo(index);
      } else {
        void openBook().then(() => {
          driverRef.current?.goTo(index);
        });
      }
    },
    [openBook],
  );

  const nextPage = useCallback(() => {
    if (stateRef.current === "OPEN") {
      driverRef.current?.step(1);
    }
  }, []);

  const previousPage = useCallback(() => {
    if (stateRef.current === "OPEN") {
      driverRef.current?.step(-1);
    }
  }, []);

  return {
    state,
    page,
    displayPage,
    ready,
    driverRef,
    openBook,
    nextPage,
    previousPage,
    goToPage,
  };
}

