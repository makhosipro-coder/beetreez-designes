import type { Layer } from '@/design-engine/types';

export type AlignMode = 'left' | 'right' | 'top' | 'bottom' | 'centerH' | 'centerV';
export type DistributeMode = 'horizontal' | 'vertical';

export interface SnapGuide {
  axis: 'h' | 'v';
  pos: number;
  color?: string;
}

export interface SnapResult {
  x: number;
  y: number;
  guides: SnapGuide[];
}

function getBounds(layers: Layer[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const l of layers) {
    const t = l.transform;
    if (t.x < minX) minX = t.x;
    if (t.y < minY) minY = t.y;
    if (t.x + t.width > maxX) maxX = t.x + t.width;
    if (t.y + t.height > maxY) maxY = t.y + t.height;
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

export function alignLayers(layers: Layer[], mode: AlignMode): Layer[] {
  if (layers.length < 2) return layers;
  const bounds = getBounds(layers);
  return layers.map((l) => {
    const t = { ...l.transform };
    switch (mode) {
      case 'left': t.x = bounds.minX; break;
      case 'right': t.x = bounds.maxX - t.width; break;
      case 'top': t.y = bounds.minY; break;
      case 'bottom': t.y = bounds.maxY - t.height; break;
      case 'centerH': t.x = bounds.cx - t.width / 2; break;
      case 'centerV': t.y = bounds.cy - t.height / 2; break;
    }
    return { ...l, transform: t };
  });
}

export function distributeLayers(layers: Layer[], mode: DistributeMode): Layer[] {
  if (layers.length < 3) return layers;
  const sorted = [...layers].sort((a, b) =>
    mode === 'horizontal' ? a.transform.x - b.transform.x : a.transform.y - b.transform.y
  );
  const bounds = getBounds(sorted);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalSpace = mode === 'horizontal'
    ? (last.transform.x + last.transform.width) - first.transform.x
    : (last.transform.y + last.transform.height) - first.transform.y;
  const totalSize = sorted.reduce((s, l) => s + (mode === 'horizontal' ? l.transform.width : l.transform.height), 0);
  const gap = (totalSpace - totalSize) / (sorted.length - 1);

  let pos = mode === 'horizontal' ? first.transform.x : first.transform.y;
  return sorted.map((l) => {
    const t = { ...l.transform };
    if (mode === 'horizontal') t.x = pos;
    else t.y = pos;
    pos += (mode === 'horizontal' ? l.transform.width : l.transform.height) + gap;
    return { ...l, transform: t };
  });
}

const SNAP_THRESHOLD = 5;

function snapEdge(value: number, candidates: number[], threshold: number): { snapped: number; guides: SnapGuide[] } {
  const guides: SnapGuide[] = [];
  let snapped = value;
  for (const c of candidates) {
    if (Math.abs(value - c) <= threshold) {
      snapped = c;
      guides.push({ axis: 'v', pos: c, color: '#6c63ff' });
    }
  }
  return { snapped, guides };
}

export function computeSnap(
  x: number, y: number, w: number, h: number,
  allLayers: Layer[], excludeId: string | null, gridSize: number, snapGrid: boolean
): SnapResult {
  const candidatesH: number[] = [];
  const candidatesV: number[] = [];
  for (const l of allLayers) {
    if (l.id === excludeId || l.type === 'group') continue;
    const t = l.transform;
    candidatesH.push(t.y, t.y + t.height / 2, t.y + t.height);
    candidatesV.push(t.x, t.x + t.width / 2, t.x + t.width);
  }

  let outX = x, outY = y;
  let allGuides: SnapGuide[] = [];
  const edgesX = [x, x + w / 2, x + w];
  const edgesY = [y, y + h / 2, y + h];

  for (const ex of edgesX) {
    const r = snapEdge(ex, candidatesV, SNAP_THRESHOLD);
    if (Math.abs(r.snapped - ex) > 0) {
      const delta = r.snapped - ex;
      outX += delta;
      allGuides = allGuides.concat(r.guides);
      break;
    }
  }

  for (const ey of edgesY) {
    const r = snapEdge(ey, candidatesH, SNAP_THRESHOLD);
    if (Math.abs(r.snapped - ey) > 0) {
      const delta = r.snapped - ey;
      outY += delta;
      allGuides = allGuides.concat(r.guides.map(g => ({ ...g, axis: 'h' as const })));
      break;
    }
  }

  if (snapGrid && gridSize > 0) {
    outX = Math.round(outX / gridSize) * gridSize;
    outY = Math.round(outY / gridSize) * gridSize;
  }

  return { x: outX, y: outY, guides: allGuides };
}
