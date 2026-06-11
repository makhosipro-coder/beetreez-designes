import { describe, it, expect, beforeEach } from 'vitest';
import { CommandStack } from '@/design-engine/history/CommandStack';
import { createLayerTree, applyOperation } from '@/design-engine/layers';
import type { Layer, LayerTreeState, LayerOperation } from '@/design-engine/layers';

function makeLayer(id: string, name = 'Layer'): Layer {
  return {
    id, type: 'rectangle', name,
    transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    opacity: 1, visible: true, locked: false,
    parentId: null, children: [], zIndex: 0,
    blendMode: 'normal', props: { fill: '#6c63ff' },
  };
}

describe('CommandStack', () => {
  let stack: CommandStack;

  beforeEach(() => {
    stack = new CommandStack();
  });

  it('starts with no undo/redo', () => {
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(false);
  });

  it('canUndo after pushing', () => {
    stack.pushSnapshot('Add layer', createLayerTree());
    expect(stack.canUndo).toBe(true);
    expect(stack.canRedo).toBe(false);
  });

  it('undo restores saved snapshot state', () => {
    const before = createLayerTree();
    const layer = makeLayer('1');
    const after = applyOperation(before, { type: 'ADD', layer, parentId: null });

    stack.pushSnapshot('Add layer', before);
    const restored = stack.undo(after);

    expect(restored.layers['1']).toBeUndefined();
    expect(restored.rootIds).not.toContain('1');
  });

  it('redo reapplies changes from operation-based entry', () => {
    const before = createLayerTree();
    const layer = makeLayer('1');
    const op = { type: 'ADD' as const, layer, parentId: null };
    const inverseOp = [{ type: 'REMOVE' as const, layerId: '1' }];

    stack.push('Add layer', [op], inverseOp);
    const after = applyOperation(before, op);
    const undone = stack.undo(after);
    expect(undone.layers['1']).toBeUndefined();

    const redone = stack.redo(undone);
    expect(redone.layers['1']).toBeDefined();
    expect(redone.layers['1'].name).toBe('Layer');
  });

  it('push clears redo history', () => {
    const s = createLayerTree();
    stack.pushSnapshot('First', applyOperation(s, { type: 'ADD', layer: makeLayer('1'), parentId: null }));
    stack.undo(s);
    expect(stack.canRedo).toBe(true);

    stack.pushSnapshot('New', s);
    expect(stack.canRedo).toBe(false);
  });

  it('undo returns same state when no history', () => {
    const s = createLayerTree();
    const result = stack.undo(s);
    expect(result).toBe(s);
  });

  it('redo returns same state when no future', () => {
    const s = createLayerTree();
    const result = stack.redo(s);
    expect(result).toBe(s);
  });

  it('clear resets state', () => {
    stack.pushSnapshot('Test', createLayerTree());
    expect(stack.canUndo).toBe(true);
    stack.clear();
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(false);
  });

  it('getHistory returns entries', () => {
    const s = createLayerTree();
    stack.pushSnapshot('First', s);
    stack.pushSnapshot('Second', applyOperation(s, { type: 'ADD', layer: makeLayer('1'), parentId: null }));

    const history = stack.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].description).toBe('First');
    expect(history[1].description).toBe('Second');
    expect(history[0].id).toBeDefined();
    expect(history[0].timestamp).toBeGreaterThan(0);
  });

  it('undo with operation-based entry reverses operations', () => {
    const initial = createLayerTree();
    const op: LayerOperation = { type: 'ADD', layer: makeLayer('1'), parentId: null };
    const inverse: LayerOperation[] = [{ type: 'REMOVE', layerId: '1' }];

    stack.push('Add layer', [op], inverse);
    const changed = applyOperation(initial, op);
    expect(changed.layers['1']).toBeDefined();

    const undone = stack.undo(changed);
    expect(undone.layers['1']).toBeUndefined();
  });

  it('redo with operation-based entry reapplies', () => {
    const initial = createLayerTree();
    const op: LayerOperation = { type: 'ADD', layer: makeLayer('1'), parentId: null };

    stack.push('Add layer', [op], [{ type: 'REMOVE', layerId: '1' }]);
    const changed = applyOperation(initial, op);
    const undone = stack.undo(changed);

    const redone = stack.redo(undone);
    expect(redone.layers['1']).toBeDefined();
  });

  it('enforces max stack size', () => {
    const s = createLayerTree();
    for (let i = 0; i < 250; i++) {
      stack.pushSnapshot(`Entry ${i}`, s);
    }
    expect(stack.getHistory()).toHaveLength(200);
  });

  it('snapshot preserves deep data', () => {
    const s = createLayerTree();
    const l1 = makeLayer('1', 'Original');
    const changed = applyOperation(s, { type: 'ADD', layer: l1, parentId: null });

    stack.pushSnapshot('Add layer', changed);
    changed.layers['1'].name = 'Mutated';

    const restored = stack.undo(changed);
    expect(restored.layers['1'].name).toBe('Original');
  });
});
