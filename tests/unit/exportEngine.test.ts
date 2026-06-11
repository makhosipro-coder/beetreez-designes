import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { ExportEngine } from '@/design-engine/export/ExportEngine';
import { createLayerTree } from '@/design-engine/layers';

function setupBrowserMocks() {
  const mockCtx: Record<string, unknown> = {
    fillStyle: '',
    fillRect: vi.fn(),
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
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
    rect: vi.fn(),
    clip: vi.fn(),
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    font: '',
    textAlign: 'left',
    getLineDash: vi.fn(() => []),
    canvas: { width: 1920, height: 1080 },
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
    measureText: vi.fn(() => ({ width: 50 })),
    arcTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createPattern: vi.fn(),
    putImageData: vi.fn(),
    getImageData: vi.fn(),
    createImageData: vi.fn(),
  };

  let toBlobCallback: ((blob: Blob | null) => void) | null = null;

  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => mockCtx),
    toBlob: vi.fn((cb: (blob: Blob | null) => void) => {
      toBlobCallback = cb;
    }),
    getBoundingClientRect: vi.fn(() => ({ width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({}) })),
    style: {},
  } as unknown as HTMLCanvasElement;

  const mockAnchor = {
    href: '',
    download: '',
    click: vi.fn(),
  };

  const documentMock = {
    createElement: vi.fn((tag: string) => {
      if (tag === 'canvas') return mockCanvas;
      if (tag === 'a') return mockAnchor;
      return {};
    }),
  };

  const fileReaderMock: {
    result: string | null;
    readAsDataURL: (...args: unknown[]) => void;
    onload: ((e: Event) => void) | null;
  } = {
    result: 'data:image/png;base64,test',
    readAsDataURL: vi.fn(function (this: { onload: ((e: Event) => void) | null }) {
      if (this.onload) (this.onload as (e: Event) => void)(new Event('load'));
    }) as (...args: unknown[]) => void,
    onload: null,
  };

  vi.stubGlobal('document', documentMock);
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:test'),
    revokeObjectURL: vi.fn(),
  });
  vi.stubGlobal('FileReader', class MockFileReader {
    result = 'data:image/png;base64,test';
    onload: ((e: Event) => void) | null = null;
    onerror: ((e: Event) => void) | null = null;
    readAsDataURL = vi.fn(function (this: MockFileReader) {
      if (this.onload) this.onload(new Event('load'));
    });
  });
  vi.stubGlobal('Blob', class MockBlob { size = 100; type = 'image/png'; constructor(..._: unknown[]) {} });

  return { mockCtx, mockCanvas, mockAnchor, fileReaderMock, getToBlobCallback: () => toBlobCallback };
}

describe('ExportEngine', () => {
  let engine: ExportEngine;
  let mocks: ReturnType<typeof setupBrowserMocks>;
  const emptyState = createLayerTree();

  beforeAll(() => {
    mocks = setupBrowserMocks();
  });

  beforeEach(() => {
    engine = new ExportEngine();
  });

  it('exports as Blob with default options', async () => {
    const promise = engine.export(emptyState);

    const cb = mocks.getToBlobCallback();
    if (cb) cb(new Blob());

    const blob = await promise;
    expect(blob).toBeDefined();
    expect(mocks.mockCtx.fillRect).toHaveBeenCalled();
    expect(mocks.mockCtx.setTransform).toHaveBeenCalled();
  });

  it('export creates canvas with correct dimensions', async () => {
    const promise = engine.export(emptyState, { width: 800, height: 600 });

    const cb = mocks.getToBlobCallback();
    if (cb) cb(new Blob());

    await promise;
    expect(mocks.mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('export returns Blob', async () => {
    const promise = engine.export(emptyState);

    const cb = mocks.getToBlobCallback();
    if (cb) cb(new Blob());

    const blob = await promise;
    expect(blob).toBeInstanceOf(Blob);
  });

  it('export rejects when toBlob returns null', async () => {
    const promise = engine.export(emptyState);

    const cb = mocks.getToBlobCallback();
    if (cb) cb(null);

    await expect(promise).rejects.toThrow('Export failed');
  });

  it('exportAsDataUrl returns data URL string', async () => {
    const promise = engine.exportAsDataUrl(emptyState);

    const cb = mocks.getToBlobCallback();
    if (cb) cb(new Blob());

    const result = await promise;
    expect(typeof result).toBe('string');
    expect(result).toContain('data:');
  });

  it('download triggers anchor click', async () => {
    const promise = engine.download(emptyState, 'test.png');

    const cb = mocks.getToBlobCallback();
    if (cb) cb(new Blob());

    await promise;
    expect(mocks.mockAnchor.click).toHaveBeenCalled();
    expect(mocks.mockAnchor.download).toBe('test.png');
  });

  it('export rejects on canvas context error', async () => {
    const badMock = { ...mocks.mockCanvas, getContext: vi.fn(() => null) };
    const doc = { createElement: vi.fn(() => badMock) };
    vi.stubGlobal('document', doc);

    const localEngine = new ExportEngine();
    await expect(localEngine.export(emptyState)).rejects.toThrow('Could not get canvas context');

    vi.stubGlobal('document', mocks.mockCanvas);
  });
});
