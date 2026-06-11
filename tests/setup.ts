if (typeof window === 'undefined') {
  const mockStorage: Record<string, string> = {};
  const mockCtx = {
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    fillText: () => {},
    measureText: () => ({ width: 10 }),
    roundRect: () => {},
    setTransform: () => {},
    clearRect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    setLineDash: () => {},
    clip: () => {},
    drawImage: () => {},
    createLinearGradient: () => mockCtx,
    addColorStop: () => {},
    globalCompositeOperation: '',
  } as any;
  global.window = {
    matchMedia: () => ({ matches: false }),
    devicePixelRatio: 1,
    ...mockCtx,
  } as any;
  global.document = {
    documentElement: { classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => false } },
    createElement: () => ({ getContext: () => mockCtx }),
  } as any;
  global.localStorage = {
    getItem: (k: string) => mockStorage[k] ?? null,
    setItem: (k: string, v: string) => { mockStorage[k] = v; },
    removeItem: (k: string) => { delete mockStorage[k]; },
    clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
    length: 0,
    key: () => null,
  };
}
