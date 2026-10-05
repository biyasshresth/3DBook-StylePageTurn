// /**
//  * Contract between the React/animation layers and the Three.js book simulation.
//  * `BookScene` implements this interface — nothing outside `src/three` may touch
//  * meshes, geometry attributes or the camera directly.
//  */

// export type BookState = 'CLOSED' | 'OPENING' | 'OPEN' | 'TURNING';

// export type TurnDirection = 1 | -1;

// export interface BookSceneOptions {
//   /** Total number of logical book pages (spreads). */
//   pageCount: number;
//   /** Optional device pixel ratio ceiling. */
//   maxPixelRatio?: number;
// }

// export interface BookSceneAPI {
//   /** Starts the render loop. */
//   start(): void;
//   /** Stops the render loop (tab hidden / unmount). */
//   stop(): void;
//   /** Recalculates renderer size, camera framing and responsive book dimensions. */
//   resize(width: number, height: number): void;
//   /** Releases geometries, materials, textures and the WebGL context. */
//   dispose(): void;

//   /** 0 = fully closed book, 1 = settled two-page spread. */
//   setOpenProgress(progress: number): void;

//   /** Positions the stacks so `index` is the visible spread (no animation). */
//   setActivePage(index: number): void;

//   /** Arms the turning leaf before a scrub/tween begins. */
//   prepareTurn(fromPage: number, direction: TurnDirection): void;

//   /** 0 → 1 normalized turn progress; drives rotation + vertex deformation. */
//   setTurnProgress(progress: number): void;

//   /** Parks the leaf into the stack and makes `index` the resting spread. */
//   commitTurn(index: number): void;

//   /** Subtle camera offset, -1 → 1. */
//   setCameraLift(amount: number): void;

//   /** Contact-shadow intensity under the moving leaf, 0 → 1. */
//   setShadowStrength(amount: number): void;
// }
