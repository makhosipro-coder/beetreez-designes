import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SelectTool } from '@/design-engine/tools/SelectTool';
import { MoveTool } from '@/design-engine/tools/MoveTool';
import { ShapeTool } from '@/design-engine/tools/ShapeTool';
import { TextTool } from '@/design-engine/tools/TextTool';
import { HandTool } from '@/design-engine/tools/HandTool';
import { toolRegistry } from '@/design-engine/tools/registry';
import { createLayerTree, applyOperation } from '@/design-engine/layers';
import type { Layer, LayerTreeState } from '@/design-engine/layers';
import type { ToolEvent, ToolContext } from '@/design-engine/tools/BaseTool';

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

function makeEvent(overrides: Partial<ToolEvent> = {}): ToolEvent {
  return {
    canvasX: 50, canvasY: 50,
    screenX: 50, screenY: 50,
    originalEvent: { pointerId: 1, clientX: 50, clientY: 50, button: 0 } as PointerEvent,
    shiftKey: false, altKey: false, ctrlKey: false,
    ...overrides,
  };
}

function makeCtx(layerState?: LayerTreeState): ToolContext {
  const ref = { state: layerState || createLayerState() };
  return {
    getLayerState: () => ref.state,
    addLayer: vi.fn((layer: Layer) => {
      ref.state = applyOperation(ref.state, { type: 'ADD', layer, parentId: layer.parentId || null });
    }),
    updateLayer: vi.fn((id: string, patch: Partial<Layer>) => {
      ref.state = applyOperation(ref.state, { type: 'UPDATE', layerId: id, patch });
    }),
    removeLayer: vi.fn((id: string) => {
      ref.state = applyOperation(ref.state, { type: 'REMOVE', layerId: id });
    }),
    selectLayer: vi.fn((id: string | null) => {
      if (id) ref.state = { ...ref.state, selectedIds: new Set([id]) };
      else ref.state = { ...ref.state, selectedIds: new Set() };
    }),
    getSelectedId: () => ref.state.selectedIds.values().next().value ?? null,
    pushHistory: vi.fn(),
  };
}

function createLayerState(): LayerTreeState {
  return { layers: {}, rootIds: [], selectedIds: new Set() };
}

describe('SelectTool', () => {
  let tool: SelectTool;
  let ctx: ToolContext;
  let s: LayerTreeState;

  beforeEach(() => {
    tool = new SelectTool();
    s = createLayerTree();
    s = applyOperation(s, { type: 'ADD', layer: makeLayer('1', { transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }), parentId: null });
    ctx = makeCtx(s);
  });

  it('selects layer on pointer down at its position', () => {
    const ev = makeEvent({ canvasX: 50, canvasY: 50 });
    tool.onPointerDown!(ev, ctx);

    expect(ctx.selectLayer).toHaveBeenCalledWith('1');
  });

  it('does not select when clicking empty space', () => {
    const ev = makeEvent({ canvasX: 200, canvasY: 200 });
    tool.onPointerDown!(ev, ctx);

    expect(ctx.selectLayer).toHaveBeenCalledWith(null);
  });

  it('adds to selection with shift key', () => {
    s = applyOperation(s, { type: 'ADD', layer: makeLayer('2', { transform: { x: 150, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }), parentId: null });
    ctx = makeCtx(s);

    const ev = makeEvent({ canvasX: 50, canvasY: 50, shiftKey: true });
    tool.onPointerDown!(ev, ctx);

    expect(ctx.selectLayer).toHaveBeenCalled();
  });

  it('re-selects already selected layer on click', () => {
    s = { ...s, selectedIds: new Set(['1']) };
    ctx = makeCtx(s);

    const ev = makeEvent({ canvasX: 50, canvasY: 50 });
    tool.onPointerDown!(ev, ctx);

    expect(ctx.selectLayer).toHaveBeenCalledWith('1');
  });
});

describe('MoveTool', () => {
  let tool: MoveTool;
  let ctx: ToolContext;

  beforeEach(() => {
    tool = new MoveTool();
    ctx = makeCtx();
  });

  it('sets cursor to move', () => {
    expect(tool.cursor).toBe('move');
  });

  it('moves layer on drag', () => {
    let s = createLayerTree();
    s = applyOperation(s, { type: 'ADD', layer: makeLayer('1'), parentId: null });
    s = { ...s, selectedIds: new Set(['1']) };
    ctx = makeCtx(s);

    const down = makeEvent({ canvasX: 50, canvasY: 50 });
    tool.onPointerDown!(down, ctx);

    const move = makeEvent({ canvasX: 80, canvasY: 70 });
    tool.onPointerMove!(move, ctx);

    expect(ctx.updateLayer).toHaveBeenCalled();
  });
});

describe('ShapeTool', () => {
  it('creates rectangle on pointer sequence', () => {
    const tool = new ShapeTool('rectangle');
    const ctx = makeCtx();

    const down = makeEvent({ canvasX: 10, canvasY: 10 });
    tool.onPointerDown!(down, ctx);

    const move = makeEvent({ canvasX: 110, canvasY: 80 });
    tool.onPointerMove!(move, ctx);

    const up = makeEvent({ canvasX: 110, canvasY: 80 });
    tool.onPointerUp!(up, ctx);

    expect(ctx.addLayer).toHaveBeenCalled();
    expect(ctx.pushHistory).toHaveBeenCalledWith('Add rectangle');
  });

  it('creates ellipse on pointer sequence', () => {
    const tool = new ShapeTool('ellipse');
    const ctx = makeCtx();

    const down = makeEvent({ canvasX: 10, canvasY: 10 });
    tool.onPointerDown!(down, ctx);
    const move = makeEvent({ canvasX: 110, canvasY: 80 });
    tool.onPointerMove!(move, ctx);
    const up = makeEvent({ canvasX: 110, canvasY: 80 });
    tool.onPointerUp!(up, ctx);

    const addedLayer = vi.mocked(ctx.addLayer).mock.calls[0][0];
    expect(addedLayer.type).toBe('ellipse');
    expect(ctx.pushHistory).toHaveBeenCalledWith('Add ellipse');
  });

  it('has crosshair cursor', () => {
    const tool = new ShapeTool('rectangle');
    expect(tool.cursor).toBe('crosshair');
  });
});

describe('TextTool', () => {
  it('creates text layer on click', () => {
    const tool = new TextTool();
    const ctx = makeCtx();

    const ev = makeEvent({ canvasX: 100, canvasY: 200 });
    tool.onPointerDown!(ev, ctx);

    expect(ctx.addLayer).toHaveBeenCalled();
    const layer = vi.mocked(ctx.addLayer).mock.calls[0][0];
    expect(layer.type).toBe('text');
    expect(layer.transform.x).toBe(100);
    expect(layer.transform.y).toBe(200);
  });

  it('has text cursor', () => {
    const tool = new TextTool();
    expect(tool.cursor).toBe('text');
  });
});

describe('HandTool', () => {
  it('sets pan callback', () => {
    const tool = new HandTool();
    const cb = vi.fn();
    tool.setPanCallback(cb);
    expect(tool.cursor).toBe('grab');
  });

  it('calls pan on drag', () => {
    const tool = new HandTool();
    const panCb = vi.fn();
    tool.setPanCallback(panCb);
    const ctx = makeCtx();

    tool.onPointerDown!(makeEvent({ screenX: 0, screenY: 0 }), ctx);
    tool.onPointerMove!(makeEvent({ screenX: 50, screenY: 30 }), ctx);
    tool.onPointerUp!(makeEvent({ screenX: 50, screenY: 30 }), ctx);

    expect(panCb).toHaveBeenCalledWith(50, 30);
  });
});

describe('ToolRegistry', () => {
  it('returns select tool by default', () => {
    const tool = toolRegistry.getTool('select');
    expect(tool.name).toBe('select');
  });

  it('falls back to select for unknown tool', () => {
    const tool = toolRegistry.getTool('nonexistent');
    expect(tool.name).toBe('select');
  });

  it('registers all 7 tools', () => {
    const names = ['select', 'move', 'hand', 'rectangle', 'ellipse', 'text', 'image'];
    for (const name of names) {
      const tool = toolRegistry.getTool(name);
      expect(tool.name).toBe(name);
    }
  });

  it('getCursor returns appropriate cursor', () => {
    expect(toolRegistry.getCursor('select')).toBe('default');
    expect(toolRegistry.getCursor('move')).toBe('move');
    expect(toolRegistry.getCursor('hand')).toBe('grab');
    expect(toolRegistry.getCursor('text')).toBe('text');
  });

  it('activate calls onActivate', () => {
    const ctx = makeCtx();
    toolRegistry.activate('select', ctx);
    expect(toolRegistry.getActiveTool()?.name).toBe('select');
  });
});
