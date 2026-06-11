import type { Layer, DesignDocument } from '@/design-engine/types';
import type { LayerTreeState, LayerOperation } from './types';

export function createLayerTree(): LayerTreeState {
  return {
    layers: {},
    rootIds: [],
    selectedIds: new Set(),
  };
}

export function applyOperation(state: LayerTreeState, op: LayerOperation): LayerTreeState {
  switch (op.type) {
    case 'ADD': {
      const layers = { ...state.layers, [op.layer.id]: op.layer };
      const rootIds = op.parentId
        ? state.rootIds
        : [...state.rootIds, op.layer.id];
      if (op.parentId && layers[op.parentId]) {
        layers[op.parentId] = {
          ...layers[op.parentId],
          children: [...layers[op.parentId].children, op.layer.id],
        };
      }
      return { ...state, layers, rootIds };
    }
    case 'REMOVE': {
      const removed = state.layers[op.layerId];
      if (!removed) return state;
      const nextLayers = { ...state.layers };
      delete nextLayers[op.layerId];
      if (removed.parentId && nextLayers[removed.parentId]) {
        nextLayers[removed.parentId] = {
          ...nextLayers[removed.parentId],
          children: nextLayers[removed.parentId].children.filter((id) => id !== op.layerId),
        };
      }
      const rootIds = state.rootIds.filter((id) => id !== op.layerId);
      const selectedIds = new Set(state.selectedIds);
      selectedIds.delete(op.layerId);
      return { ...state, layers: nextLayers, rootIds, selectedIds };
    }
    case 'UPDATE': {
      const existing = state.layers[op.layerId];
      if (!existing) return state;
      return {
        ...state,
        layers: {
          ...state.layers,
          [op.layerId]: { ...existing, ...op.patch },
        },
      };
    }
    case 'REORDER': {
      const layer = state.layers[op.layerId];
      if (!layer) return state;
      const updated = { ...layer, zIndex: op.index };
      return reindexSiblings({
        ...state,
        layers: { ...state.layers, [op.layerId]: updated },
      });
    }
    case 'MOVE': {
      const layer = state.layers[op.layerId];
      if (!layer) return state;
      const layers = { ...state.layers };
      if (layer.parentId && layers[layer.parentId]) {
        layers[layer.parentId] = {
          ...layers[layer.parentId],
          children: layers[layer.parentId].children.filter((id) => id !== op.layerId),
        };
      }
      const moved = { ...layer, parentId: op.parentId };
      layers[op.layerId] = moved;
      if (op.parentId && layers[op.parentId]) {
        const children = [...layers[op.parentId].children];
        children.splice(op.index, 0, op.layerId);
        layers[op.parentId] = { ...layers[op.parentId], children };
      }
      return { ...state, layers, rootIds: op.parentId ? state.rootIds.filter((id) => id !== op.layerId) : state.rootIds };
    }
    case 'GROUP': {
      const groupLayers = { ...state.layers };
      const group: Layer = {
        id: op.groupId,
        type: 'group',
        name: 'Group',
        transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        opacity: 1,
        visible: true,
        locked: false,
        parentId: null,
        children: op.layerIds,
        zIndex: 0,
        blendMode: 'normal',
        props: {},
      };
      for (const childId of op.layerIds) {
        if (groupLayers[childId]) {
          groupLayers[childId] = { ...groupLayers[childId], parentId: op.groupId };
        }
      }
      groupLayers[op.groupId] = group;
      const rootIds = state.rootIds
        .filter((id) => !op.layerIds.includes(id))
        .concat(op.groupId);
      return { ...state, layers: groupLayers, rootIds };
    }
    case 'UNGROUP': {
      const group = state.layers[op.groupId];
      if (!group) return state;
      const ungroupLayers = { ...state.layers };
      delete ungroupLayers[op.groupId];
      const ungroupRootIds = state.rootIds
        .filter((id) => id !== op.groupId)
        .concat(group.children);
      return reindexSiblings({ ...state, layers: ungroupLayers, rootIds: ungroupRootIds });
    }
    case 'DUPLICATE': {
      const original = state.layers[op.layerId];
      if (!original) return state;
      const clone: Layer = {
        ...original,
        id: op.newId,
        name: `${original.name} (copy)`,
        zIndex: original.zIndex + 0.5,
      };
      return applyOperation(state, { type: 'ADD', layer: clone, parentId: original.parentId });
    }
    default:
      return state;
  }
}

export function buildDocumentTree(state: LayerTreeState): Layer[] {
  const ordered = [...state.rootIds]
    .map((id) => state.layers[id])
    .filter(Boolean)
    .sort((a, b) => a.zIndex - b.zIndex);

  return ordered;
}

function reindexSiblings(state: LayerTreeState): LayerTreeState {
  const layers = { ...state.layers };
  for (const rootId of state.rootIds) {
    const layer = layers[rootId];
    if (layer) {
      layers[rootId] = { ...layer, zIndex: state.rootIds.indexOf(rootId) };
    }
  }
  return { ...state, layers };
}

export function layerFromDocument(doc: DesignDocument): LayerTreeState {
  return {
    layers: doc.layers,
    rootIds: doc.rootIds,
    selectedIds: new Set(),
  };
}
