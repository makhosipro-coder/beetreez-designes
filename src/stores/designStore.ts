import { create } from 'zustand';
import type { DesignDocument, Layer } from '@/design-engine/types';
import type { LayerTreeState } from '@/design-engine/layers';
import { createLayerTree, applyOperation } from '@/design-engine/layers';
import { CommandStack } from '@/design-engine/history';
import type { LayerOperation } from '@/design-engine/layers';
import { v4 as uuid } from 'uuid';
import { storage } from '@/utils/browser/storage';
import { useAuthStore } from '@/stores/authStore';
import { alignLayers, distributeLayers } from '@/utils/design/alignment';
import type { AlignMode, DistributeMode } from '@/utils/design/alignment';

const DRAFT_KEY = 'design-draft';
const AUTO_SAVE_DELAY = 2000;

interface DesignStore {
  document: DesignDocument | null;
  layerState: LayerTreeState;
  commandStack: CommandStack;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;

  initDocument: (width?: number, height?: number) => void;
  loadDocument: (doc: DesignDocument) => void;
  addLayer: (layer: Layer, parentId?: string | null) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, patch: Partial<Layer>) => void;
  setLayerState: (state: LayerTreeState) => void;
  selectLayer: (layerId: string | null) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;
  undo: () => void;
  redo: () => void;
  getSelectedLayer: () => Layer | null;
  pushHistory: (description: string) => void;
  alignSelectedLayers: (mode: AlignMode) => void;
  distributeSelectedLayers: (mode: DistributeMode) => void;
  getState: () => DesignStore;
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  document: null,
  layerState: createLayerTree(),
  commandStack: new CommandStack(),
  isDirty: false,
  canUndo: false,
  canRedo: false,

  getState: () => get(),

  initDocument: (width = 1920, height = 1080) => {
    const doc: DesignDocument = {
      id: uuid(),
      name: 'Untitled Design',
      width,
      height,
      layers: {},
      rootIds: [],
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        authorId: useAuthStore.getState().user?.id || 'anonymous',
      },
    };
    const cs = new CommandStack();
    set({ document: doc, layerState: createLayerTree(), commandStack: cs, isDirty: false, canUndo: false, canRedo: false });
  },

  loadDocument: (doc: DesignDocument) => {
    const layerState: LayerTreeState = {
      layers: doc.layers,
      rootIds: doc.rootIds,
      selectedIds: new Set(),
    };
    const cs = new CommandStack();
    set({ document: doc, layerState, commandStack: cs, isDirty: false, canUndo: false, canRedo: false });
  },

  addLayer: (layer: Layer, parentId: string | null = null) => {
    const { layerState, commandStack } = get();
    const op: LayerOperation = { type: 'ADD', layer, parentId };
    commandStack.push('Add layer', [op], []);
    const updated = applyOperation(layerState, op);
    set({ layerState: updated, isDirty: true, canUndo: true, canRedo: false });
  },

  removeLayer: (layerId: string) => {
    const { layerState, commandStack } = get();
    const op: LayerOperation = { type: 'REMOVE', layerId };
    commandStack.push('Remove layer', [op], []);
    const updated = applyOperation(layerState, op);
    set({ layerState: updated, isDirty: true, canUndo: true, canRedo: false });
  },

  updateLayer: (layerId: string, patch: Partial<Layer>) => {
    const { layerState } = get();
    const op: LayerOperation = { type: 'UPDATE', layerId, patch };
    const updated = applyOperation(layerState, op);
    set({ layerState: updated, isDirty: true });
  },

  setLayerState: (state: LayerTreeState) => set({ layerState: state, isDirty: true }),

  selectLayer: (layerId: string | null) => {
    const { layerState } = get();
    const selectedIds = new Set(layerState.selectedIds);
    if (layerId && selectedIds.has(layerId)) {
      selectedIds.delete(layerId);
    } else if (layerId) {
      selectedIds.clear();
      selectedIds.add(layerId);
    } else {
      selectedIds.clear();
    }
    set({ layerState: { ...layerState, selectedIds } });
  },

  toggleLayerVisibility: (layerId: string) => {
    const { layerState } = get();
    const layer = layerState.layers[layerId];
    if (!layer) return;
    get().updateLayer(layerId, { visible: !layer.visible });
  },

  toggleLayerLock: (layerId: string) => {
    const { layerState } = get();
    const layer = layerState.layers[layerId];
    if (!layer) return;
    get().updateLayer(layerId, { locked: !layer.locked });
  },

  undo: () => {
    const { commandStack, layerState } = get();
    const updated = commandStack.undo(layerState);
    set({ layerState: updated, isDirty: true, canUndo: commandStack.canUndo, canRedo: commandStack.canRedo });
  },

  redo: () => {
    const { commandStack, layerState } = get();
    const updated = commandStack.redo(layerState);
    set({ layerState: updated, isDirty: true, canUndo: commandStack.canUndo, canRedo: commandStack.canRedo });
  },

  getSelectedLayer: () => {
    const { layerState } = get();
    const selectedId = layerState.selectedIds.values().next().value;
    if (!selectedId) return null;
    return layerState.layers[selectedId] || null;
  },

  pushHistory: (description: string) => {
    const { commandStack, layerState } = get();
    commandStack.pushSnapshot(description, layerState);
    set({ canUndo: true, canRedo: false });
  },

  alignSelectedLayers: (mode: AlignMode) => {
    const { layerState } = get();
    const ids = [...layerState.selectedIds];
    if (ids.length < 2) return;
    const layers = ids.map((id) => layerState.layers[id]).filter(Boolean);
    if (layers.length < 2) return;
    const aligned = alignLayers(layers, mode);
    get().pushHistory(`Align ${mode}`);
    for (const l of aligned) {
      get().updateLayer(l.id, { transform: l.transform });
    }
  },

  distributeSelectedLayers: (mode: DistributeMode) => {
    const { layerState } = get();
    const ids = [...layerState.selectedIds];
    if (ids.length < 3) return;
    const layers = ids.map((id) => layerState.layers[id]).filter(Boolean);
    if (layers.length < 3) return;
    const disted = distributeLayers(layers, mode);
    get().pushHistory(`Distribute ${mode}`);
    for (const l of disted) {
      get().updateLayer(l.id, { transform: l.transform });
    }
  },
}));
