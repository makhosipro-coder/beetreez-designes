import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, isValidHex, hexToHsl } from '@/utils/design/color';

describe('hexToRgb', () => {
  it('converts hex to RGB', () => {
    expect(hexToRgb('#6c63ff')).toEqual({ r: 108, g: 99, b: 255 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('#xyz')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('converts RGB to hex', () => {
    expect(rgbToHex(108, 99, 255)).toBe('#6c63ff');
  });
});

describe('isValidHex', () => {
  it('validates correct hex', () => expect(isValidHex('#6c63ff')).toBe(true));
  it('rejects short hex', () => expect(isValidHex('#fff')).toBe(false));
  it('rejects invalid', () => expect(isValidHex('notacolor')).toBe(false));
});

describe('hexToHsl', () => {
  it('converts hex to HSL', () => {
    const hsl = hexToHsl('#ff0000');
    expect(hsl).toBeDefined();
    expect(hsl!.h).toBe(0);
    expect(hsl!.s).toBe(100);
    expect(hsl!.l).toBe(50);
  });
});
