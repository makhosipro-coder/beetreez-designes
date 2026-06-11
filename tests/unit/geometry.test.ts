import { describe, it, expect } from 'vitest';
import { pointInBounds, boundsOverlap, clamp, degToRad } from '@/utils/design/geometry';

describe('pointInBounds', () => {
  it('returns true when point is inside bounds', () => {
    expect(pointInBounds({ x: 10, y: 10 }, { x: 0, y: 0, width: 100, height: 100 })).toBe(true);
  });

  it('returns false when point is outside bounds', () => {
    expect(pointInBounds({ x: 200, y: 10 }, { x: 0, y: 0, width: 100, height: 100 })).toBe(false);
  });
});

describe('boundsOverlap', () => {
  it('returns true for overlapping bounds', () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 50, y: 50, width: 100, height: 100 };
    expect(boundsOverlap(a, b)).toBe(true);
  });

  it('returns false for non-overlapping bounds', () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 200, y: 200, width: 100, height: 100 };
    expect(boundsOverlap(a, b)).toBe(false);
  });
});

describe('clamp', () => {
  it('clamps to min', () => expect(clamp(-5, 0, 100)).toBe(0));
  it('clamps to max', () => expect(clamp(150, 0, 100)).toBe(100));
  it('keeps value in range', () => expect(clamp(50, 0, 100)).toBe(50));
});

describe('degToRad', () => {
  it('converts 180 degrees to PI', () => expect(degToRad(180)).toBe(Math.PI));
  it('converts 0 degrees to 0', () => expect(degToRad(0)).toBe(0));
});
