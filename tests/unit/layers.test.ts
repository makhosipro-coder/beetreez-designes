import { describe, it, expect, beforeEach } from 'vitest';
import { createLayerTree, applyOperation } from '@/design-engine/layers';
import type { Layer } from '@/design-engine/types';
import type { LayerTreeState } from '@/design-engine/layers';

function makeLayer(id: string, name = 'Layer'): Layer {
  return {
    id,
    type: 'rectangle',
    name,
    transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    opacity: 1,
    visible: true,
    locked: false,
    parentId: null,
    children: [],
    zIndex: 0,
    blendMode: 'normal',
    props: { fill: '#6c63ff' },
  };
}

describe('LayerTree', () => {
  let state: LayerTreeState;

  beforeEach(() => {
    state = createLayerTree();
  });

  it('starts empty', () => {
    expect(Object.keys(state.layers)).toHaveLength(0);
    expect(state.rootIds).toHaveLength(0);
  });

  it('adds a layer', () => {
    state = applyOperation(state, { type: 'ADD', layer: makeLayer('1'), parentId: null });
    expect(state.layers['1']).toBeDefined();
    expect(state.rootIds).toContain('1');
  });

  it('removes a layer', () => {
    state = applyOperation(state, { type: 'ADD', layer: makeLayer('1'), parentId: null });
    state = applyOperation(state, { type: 'REMOVE', layerId: '1' });
    expect(state.layers['1']).toBeUndefined();
    expect(state.rootIds).not.toContain('1');
  });

  it('updates a layer', () => {
    state = applyOperation(state, { type: 'ADD', layer: makeLayer('1'), parentId: null });
    state = applyOperation(state, { type: 'UPDATE', layerId: '1', patch: { name: 'Updated' } });
    expect(state.layers['1'].name).toBe('Updated');
  });

  it('groups layers', () => {
    state = applyOperation(state, { type: 'ADD', layer: makeLayer('1'), parentId: null });
    state = applyOperation(state, { type: 'ADD', layer: makeLayer('2'), parentId: null });
    state = applyOperation(state, { type: 'GROUP', layerIds: ['1', '2'], groupId: 'group-1' });
    expect(state.layers['group-1']).toBeDefined();
    expect(state.layers['group-1'].children).toEqual(['1', '2']);
    expect(state.layers['1'].parentId).toBe('group-1');
    expect(state.layers['2'].parentId).toBe('group-1');
    expect(state.rootIds).toEqual(['group-1']);
  });
});
