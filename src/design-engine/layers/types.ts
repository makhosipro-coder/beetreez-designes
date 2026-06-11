import type { Layer } from '@/design-engine/types';

export interface LayerTreeState {
  layers: Record<string, Layer>;
  rootIds: string[];
  selectedIds: Set<string>;
}

export type LayerOperation =
  | { type: 'ADD'; layer: Layer; parentId: string | null; index?: number }
  | { type: 'REMOVE'; layerId: string }
  | { type: 'MOVE'; layerId: string; parentId: string | null; index: number }
  | { type: 'REORDER'; layerId: string; index: number }
  | { type: 'UPDATE'; layerId: string; patch: Partial<Layer> }
  | { type: 'GROUP'; layerIds: string[]; groupId: string }
  | { type: 'UNGROUP'; groupId: string }
  | { type: 'DUPLICATE'; layerId: string; newId: string };
