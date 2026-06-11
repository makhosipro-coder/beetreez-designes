import type { Layer } from '@/design-engine/types';
import type { LayerOperation } from '@/design-engine/layers';

export function createAddLayerCommand(layer: Layer, parentId: string | null): LayerOperation {
  return { type: 'ADD', layer, parentId };
}

export function createRemoveLayerCommand(layerId: string): LayerOperation {
  return { type: 'REMOVE', layerId };
}

export function createUpdateLayerCommand(
  layerId: string,
  patch: Partial<Layer>,
): LayerOperation {
  return { type: 'UPDATE', layerId, patch };
}

export function createMoveLayerCommand(
  layerId: string,
  parentId: string | null,
  index: number,
): LayerOperation {
  return { type: 'MOVE', layerId, parentId, index };
}

export function createReorderCommand(
  layerId: string,
  index: number,
): LayerOperation {
  return { type: 'REORDER', layerId, index };
}

export function createGroupCommand(
  layerIds: string[],
  groupId: string,
): LayerOperation {
  return { type: 'GROUP', layerIds, groupId };
}

export function createUngroupCommand(groupId: string): LayerOperation {
  return { type: 'UNGROUP', groupId };
}

export function createDuplicateCommand(
  layerId: string,
  newId: string,
): LayerOperation {
  return { type: 'DUPLICATE', layerId, newId };
}
