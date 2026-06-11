import { describe, it, expect } from 'vitest';
import { alignLayers, distributeLayers, computeSnap } from '@/utils/design/alignment';
import type { Layer } from '@/design-engine/types';

function makeLayer(id: string, x: number, y: number, w: number, h: number): Layer {
  return {
    id, type: 'rectangle', name: id,
    transform: { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
    opacity: 1, visible: true, locked: false, parentId: null, children: [],
    zIndex: 0, blendMode: 'normal', props: {},
  };
}

describe('alignLayers', () => {
  it('aligns left edges', () => {
    const layers = [makeLayer('1', 100, 50, 200, 100), makeLayer('2', 300, 150, 100, 80)];
    const result = alignLayers(layers, 'left');
    expect(result[0].transform.x).toBe(100);
    expect(result[1].transform.x).toBe(100);
  });

  it('aligns right edges', () => {
    const layers = [makeLayer('1', 100, 50, 200, 100), makeLayer('2', 300, 150, 100, 80)];
    const result = alignLayers(layers, 'right');
    expect(result[0].transform.x + result[0].transform.width).toBe(400);
    expect(result[1].transform.x + result[1].transform.width).toBe(400);
  });

  it('aligns top edges', () => {
    const layers = [makeLayer('1', 100, 50, 200, 100), makeLayer('2', 300, 150, 100, 80)];
    const result = alignLayers(layers, 'top');
    expect(result[0].transform.y).toBe(50);
    expect(result[1].transform.y).toBe(50);
  });

  it('aligns bottom edges', () => {
    const layers = [makeLayer('1', 100, 50, 200, 100), makeLayer('2', 300, 150, 100, 80)];
    const result = alignLayers(layers, 'bottom');
    expect(result[0].transform.y + result[0].transform.height).toBe(230);
    expect(result[1].transform.y + result[1].transform.height).toBe(230);
  });

  it('centers horizontally', () => {
    const layers = [makeLayer('1', 100, 50, 200, 100), makeLayer('2', 500, 150, 100, 80)];
    const result = alignLayers(layers, 'centerH');
    const cx = (100 + 500 + 100) / 2;
    expect(result[0].transform.x + result[0].transform.width / 2).toBe(cx);
    expect(result[1].transform.x + result[1].transform.width / 2).toBe(cx);
  });

  it('centers vertically', () => {
    const layers = [makeLayer('1', 100, 50, 200, 100), makeLayer('2', 300, 200, 100, 80)];
    const result = alignLayers(layers, 'centerV');
    expect(result[0].transform.y + result[0].transform.height / 2).toBe(165);
    expect(result[1].transform.y + result[1].transform.height / 2).toBe(165);
  });

  it('returns same array for single layer', () => {
    const layers = [makeLayer('1', 100, 50, 200, 100)];
    const result = alignLayers(layers, 'left');
    expect(result).toHaveLength(1);
    expect(result[0].transform.x).toBe(100);
  });
});

describe('distributeLayers', () => {
  it('distributes horizontally', () => {
    const layers = [
      makeLayer('1', 0, 0, 100, 50),
      makeLayer('2', 200, 0, 100, 50),
      makeLayer('3', 500, 0, 100, 50),
    ];
    const result = distributeLayers(layers, 'horizontal');
    const totalSpace = (500 + 100) - 0;
    const totalSize = 300;
    const gap = (totalSpace - totalSize) / 2;
    expect(result[0].transform.x).toBe(0);
    expect(result[1].transform.x).toBe(100 + gap);
    expect(result[2].transform.x).toBe(100 + gap + 100 + gap);
  });

  it('distributes vertically', () => {
    const layers = [
      makeLayer('1', 0, 0, 50, 100),
      makeLayer('2', 0, 150, 50, 100),
      makeLayer('3', 0, 400, 50, 100),
    ];
    const result = distributeLayers(layers, 'vertical');
    const totalSpace = (400 + 100) - 0;
    const totalSize = 300;
    const gap = (totalSpace - totalSize) / 2;
    expect(result[0].transform.y).toBe(0);
    expect(result[1].transform.y).toBe(100 + gap);
    expect(result[2].transform.y).toBe(100 + gap + 100 + gap);
  });

  it('returns same array for 2 layers', () => {
    const layers = [makeLayer('1', 0, 0, 100, 50), makeLayer('2', 200, 0, 100, 50)];
    const result = distributeLayers(layers, 'horizontal');
    expect(result).toHaveLength(2);
  });
});

describe('computeSnap', () => {
  it('returns original position when no candidates', () => {
    const r = computeSnap(100, 100, 50, 50, [], null, 0, false);
    expect(r.x).toBe(100);
    expect(r.y).toBe(100);
    expect(r.guides).toHaveLength(0);
  });

  it('snaps to nearby layer edge', () => {
    const other = makeLayer('other', 200, 0, 50, 50);
    const r = computeSnap(195, 100, 50, 50, [other], 'moving', 0, false);
    expect(r.x).toBe(200);
    expect(r.guides.length).toBeGreaterThan(0);
  });

  it('snaps to grid when enabled', () => {
    const r = computeSnap(123, 87, 50, 50, [], null, 20, true);
    expect(r.x % 20).toBe(0);
    expect(r.y % 20).toBe(0);
  });
});
