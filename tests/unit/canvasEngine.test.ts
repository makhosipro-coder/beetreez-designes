import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasEngine } from '@/design-engine/canvas/CanvasEngine';
import { createLayerTree, applyOperation } from '@/design-engine/layers';
import type { Layer, LayerTreeState } from '@/design-engine/layers';

function makeLayer(id: string, overrides: Partial<Layer> = {}): Layer {
  return {
    id, type: 'rectangle', name: `Layer ${id}`,
    transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    opacity: 1, visible: true, locked: false,
    parentId: null, children: [], zIndex: 0,
    blendMode: 'normal', props: { fill: '#6c63ff' },
    ...overrides,
  };
}

function createMockCtx(): CanvasRenderingContext2D {
  return {
    canvas: { width: 800, height: 600 },
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    stroke: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    setLineDash: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    getLineDash: vi.fn(() => []),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    font: '',
    textAlign: 'left',
    lineDashOffset: 0,
    miterLimit: 10,
    lineCap: 'butt',
    lineJoin: 'miter',
    filter: 'none',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low',
    direction: 'ltr',
    getContextAttributes: vi.fn(),
    isPointInPath: vi.fn(),
    isPointInStroke: vi.fn(),
    measureText: vi.fn(() => ({ width: 50, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 10, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 50, fontBoundingBoxAscent: 10, fontBoundingBoxDescent: 10 })),
    arcTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createPattern: vi.fn(),
    putImageData: vi.fn(),
    getImageData: vi.fn(),
    createImageData: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

function createMockCanvas(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
  return {
    getContext: vi.fn((_id: string) => ctx),
    getBoundingClientRect: vi.fn(() => ({ width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({}) })),
    width: 0,
    height: 0,
    style: {} as CSSStyleDeclaration,
  } as unknown as HTMLCanvasElement;
}

let state: LayerTreeState;

beforeEach(() => {
  if (typeof window === 'undefined') {
    (globalThis as Record<string, unknown>).window = { devicePixelRatio: 1 } as Window & typeof globalThis;
  }
  state = createLayerTree();
});

describe('CanvasEngine', () => {
  it('constructs with canvas element', () => {
    const ctx = createMockCtx();
    const canvas = createMockCanvas(ctx);
    const engine = new CanvasEngine(canvas);

    expect(engine).toBeInstanceOf(CanvasEngine);
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('constructs with explicit dimensions', () => {
    const ctx = createMockCtx();
    const canvas = createMockCanvas(ctx);
    const engine = new CanvasEngine(canvas, 1920, 1080);

    expect(engine).toBeInstanceOf(CanvasEngine);
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
  });

  it('setViewport updates viewport', () => {
    const engine = new CanvasEngine(createMockCanvas(createMockCtx()));
    engine.setViewport({ x: 100, y: 50, zoom: 2 });

    const vp = engine.getViewport();
    expect(vp.x).toBe(100);
    expect(vp.y).toBe(50);
    expect(vp.zoom).toBe(2);
  });

  it('pan shifts viewport', () => {
    const engine = new CanvasEngine(createMockCanvas(createMockCtx()));
    engine.pan(30, 20);
    const vp = engine.getViewport();
    expect(vp.x).toBe(30);
    expect(vp.y).toBe(20);
  });

  it('screenToCanvas converts coordinates', () => {
    const engine = new CanvasEngine(createMockCanvas(createMockCtx()));
    engine.setViewport({ x: 50, y: 30, zoom: 2 });
    const result = engine.screenToCanvas(250, 130);

    expect(result.x).toBe(100);
    expect(result.y).toBe(50);
  });

  it('canvasToScreen converts coordinates', () => {
    const engine = new CanvasEngine(createMockCanvas(createMockCtx()));
    engine.setViewport({ x: 50, y: 30, zoom: 2 });
    const result = engine.canvasToScreen(100, 50);

    expect(result.x).toBe(250);
    expect(result.y).toBe(130);
  });

  it('render calls draw methods', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    engine.render(state);

    expect(ctx.setTransform).toHaveBeenCalled();
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('render draws visible layers', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const withLayer = applyOperation(state, { type: 'ADD', layer: makeLayer('1', { transform: { x: 10, y: 10, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 } }), parentId: null });
    engine.render(withLayer);

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalled();
  });

  it('render skips invisible layers', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const withLayer = applyOperation(state, { type: 'ADD', layer: makeLayer('1', { visible: false, name: 'Invisible' }), parentId: null });
    engine.render(withLayer);

    const calls = vi.mocked(ctx.fillText).mock.calls;
    expect(calls.length).toBe(0);
  });

  it('hitTest returns layer at point', () => {
    const engine = new CanvasEngine(createMockCanvas(createMockCtx()));
    const withLayer = applyOperation(state, { type: 'ADD', layer: makeLayer('1', { transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }), parentId: null });

    const hit = engine.hitTest(withLayer, 50, 50);
    expect(hit).not.toBeNull();
    expect(hit!.id).toBe('1');
  });

  it('hitTest returns null outside layer bounds', () => {
    const engine = new CanvasEngine(createMockCanvas(createMockCtx()));
    const withLayer = applyOperation(state, { type: 'ADD', layer: makeLayer('1', { transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }), parentId: null });

    const hit = engine.hitTest(withLayer, 200, 200);
    expect(hit).toBeNull();
  });

  it('hitTest ignores locked layers', () => {
    const engine = new CanvasEngine(createMockCanvas(createMockCtx()));
    const withLayer = applyOperation(state, { type: 'ADD', layer: makeLayer('1', { locked: true, transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }), parentId: null });

    const hit = engine.hitTest(withLayer, 50, 50);
    expect(hit).toBeNull();
  });

  it('hitTest returns topmost layer on overlap', () => {
    const engine = new CanvasEngine(createMockCanvas(createMockCtx()));
    let s = applyOperation(state, { type: 'ADD', layer: makeLayer('1', { zIndex: 0, transform: { x: 0, y: 0, width: 200, height: 200, rotation: 0, scaleX: 1, scaleY: 1 } }), parentId: null });
    s = applyOperation(s, { type: 'ADD', layer: makeLayer('2', { zIndex: 1, transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }), parentId: null });

    const hit = engine.hitTest(s, 75, 75);
    expect(hit).not.toBeNull();
    expect(hit!.id).toBe('2');
  });

  it('renders selection overlay for selected layer', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const l1 = makeLayer('1');
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    s = { ...s, selectedIds: new Set(['1']) };
    engine.render(s);

    expect(ctx.strokeRect).toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe('#6c63ff');
  });

  it('renders blend modes', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const l1 = makeLayer('1', { blendMode: 'multiply' });
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    engine.render(s);

    expect(ctx.globalCompositeOperation).toBe('multiply');
  });

  it('applies shadows when props exist', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const l1 = makeLayer('1', { props: { fill: '#6c63ff', shadowColor: '#000', shadowBlur: 10, shadowOffsetX: 5, shadowOffsetY: 5 } });
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    engine.render(s);

    expect(ctx.shadowColor).toBe('#000');
    expect(ctx.shadowBlur).toBe(10);
  });

  it('renders gradient fill', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const gradient = { type: 'linear' as const, angle: 45, stops: [{ offset: 0, color: '#f00' }, { offset: 1, color: '#00f' }] };
    const l1 = makeLayer('1', { props: { fill: '#6c63ff', gradient } });
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    engine.render(s);

    expect(ctx.createLinearGradient).toHaveBeenCalled();
  });

  it('renders corner radius', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const l1 = makeLayer('1', { props: { fill: '#6c63ff', cornerRadius: 10 } });
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    engine.render(s);

    expect(ctx.roundRect).toHaveBeenCalledWith(0, 0, 100, 100, 10);
  });

  it('renders stroke on ellipse shape', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const l1 = makeLayer('1', { type: 'ellipse', props: { fill: '#6c63ff', strokeColor: '#fff', strokeWidth: 3 } });
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    engine.render(s);

    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.ellipse).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('renders ellipse type', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const l1 = makeLayer('1', { type: 'ellipse' });
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    engine.render(s);

    expect(ctx.ellipse).toHaveBeenCalled();
  });

  it('renders text type', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const l1 = makeLayer('1', { type: 'text', props: { text: 'Hello', fontFamily: 'Inter', fontSize: 20, fill: '#fff' } });
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    engine.render(s);

    expect(ctx.fillText).toHaveBeenCalledWith('Hello', 0, 16);
  });

  it('renders line type', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const l1 = makeLayer('1', { type: 'line', props: { strokeColor: '#f00', strokeWidth: 2 } });
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    engine.render(s);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('renders polygon type', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    const points = [{ x: 0, y: 50 }, { x: 50, y: 0 }, { x: 100, y: 50 }];
    const l1 = makeLayer('1', { type: 'polygon', props: { fill: '#6c63ff', points } });
    let s = applyOperation(state, { type: 'ADD', layer: l1, parentId: null });
    engine.render(s);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('destroy clears canvas', () => {
    const ctx = createMockCtx();
    const engine = new CanvasEngine(createMockCanvas(ctx));
    engine.destroy();

    expect(ctx.clearRect).toHaveBeenCalled();
  });
});
