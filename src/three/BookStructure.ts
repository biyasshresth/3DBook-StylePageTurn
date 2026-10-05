import * as THREE from 'three';
import { PageMesh } from './PageMesh';
import {
  createContactTexture, createCoverTexture, createEdgeTexture, createLeftPageTexture,
  createRightPageTexture, createShadowTexture,
} from './PageMaterial';
import { PAGE_COPY } from '../data/pageCopy';
import type { BookPage } from '../data/pages';

export const DIMS = { W: 1, H: 1.18, PW: 0.985, PH: 1.162, T: 0.03, BLOCK: 0.05, GAP: 0.0035, OVER: 0.024 } as const;

export interface BookParts {
  root: THREE.Group;
  sheets: PageMesh[];
  coverPivot: THREE.Group;
  shadowRight: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  shadowLeft: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  contact: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  coverRightZ: number;
  dispose(): void;
}

export interface BuildOptions {
  pages: BookPage[];
  segments: [number, number];
  textureWidth: number;
  anisotropy: number;
}

export function buildBook({ pages, segments, textureWidth, anisotropy }: BuildOptions): BookParts {
  const { W, H, PW, PH, T, BLOCK, GAP, OVER } = DIMS;
  const trash: { dispose(): void }[] = [];
  const track = <X extends { dispose(): void }>(x: X): X => { trash.push(x); return x; };
  const tw = textureWidth;
  const th = Math.round((tw * PH) / PW);
  const S = pages.length - 1;
  const copy = (i: number) => PAGE_COPY[pages[i].component] ?? null;
  const paper = (map: THREE.Texture, side: THREE.Side = THREE.FrontSide) =>
    track(new THREE.MeshStandardMaterial({ map: track(map), roughness: 0.92, metalness: 0, side }));

  const root = new THREE.Group();
  const board = track(new THREE.BoxGeometry(W + OVER, H + OVER * 2, T));
  const goldEdge = track(new THREE.MeshStandardMaterial({ color: 0x8f6a31, roughness: 0.5, metalness: 0.4 }));

  const back = new THREE.Mesh(board, goldEdge);
  back.position.set((W + OVER) / 2, 0, -T / 2);
  back.receiveShadow = true;

  const edgeX = paper(createEdgeTexture(anisotropy, false));
  const edgeY = paper(createEdgeTexture(anisotropy, true));
  const top = paper(createRightPageTexture(copy(S), S * 2 + 1, tw, th, anisotropy));
  const block = new THREE.Mesh(track(new THREE.BoxGeometry(PW, PH, BLOCK)), [edgeX, edgeX, edgeY, edgeY, top, edgeX]);
  block.position.set(PW / 2 + 0.002, 0, BLOCK / 2);
  block.receiveShadow = true;

  const sheets: PageMesh[] = [];
  for (let k = 0; k < S; k++) {
    const front = paper(createRightPageTexture(copy(k), k * 2 + 1, tw, th, anisotropy));
    const rear = paper(createLeftPageTexture(copy(k + 1), (k + 1) * 2, tw, th, anisotropy, true), THREE.BackSide);
    const sheet = new PageMesh(PW, PH, segments, front, rear);
    sheet.group.position.x = 0.002;
    sheets.push(sheet);
    root.add(sheet.group);
  }

  const coverTex = track(createCoverTexture(tw, Math.round((tw * (H + OVER * 2)) / (W + OVER)), anisotropy));
  const coverMat = track(new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.46, metalness: 0.18 }));
  const endpaper = paper(createLeftPageTexture(null, 0, tw, th, anisotropy, false));
  const cover = new THREE.Mesh(board, [goldEdge, goldEdge, goldEdge, goldEdge, coverMat, endpaper]);
  cover.position.set((W + OVER) / 2, 0, T / 2);
  cover.castShadow = true;
  cover.receiveShadow = true;
  const coverPivot = new THREE.Group();
  const coverRightZ = BLOCK + S * GAP + 0.002;
  coverPivot.position.z = coverRightZ;
  coverPivot.add(cover);

  const shadowTex = track(createShadowTexture());
  const shadowGeo = track(new THREE.PlaneGeometry(PW, PH));
  const shadowMat = () => track(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false }));
  const shadowRight = new THREE.Mesh(shadowGeo, shadowMat());
  shadowRight.position.x = PW / 2;
  const shadowLeft = new THREE.Mesh(shadowGeo, shadowMat());
  shadowLeft.position.x = -PW / 2;
  shadowLeft.scale.x = -1;
  shadowRight.renderOrder = shadowLeft.renderOrder = 2;

  const contact = new THREE.Mesh(
    track(new THREE.PlaneGeometry(1, 1)),
    track(new THREE.MeshBasicMaterial({ map: track(createContactTexture()), transparent: true, depthWrite: false, opacity: 0.9 })),
  );
  contact.position.z = -T - 0.004;

  root.add(contact, back, block, coverPivot, shadowRight, shadowLeft);

  return {
    root, sheets, coverPivot, shadowRight, shadowLeft, contact, coverRightZ,
    dispose: () => {
      sheets.forEach((s) => s.dispose());
      trash.forEach((d) => d.dispose());
    },
  };
}
