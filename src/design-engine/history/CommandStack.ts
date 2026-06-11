import type { LayerTreeState, LayerOperation } from '@/design-engine/layers';
import { applyOperation } from '@/design-engine/layers';

interface CommandEntry {
  id: string;
  description: string;
  operations: LayerOperation[];
  inverse: LayerOperation[];
  snapshot: LayerTreeState | null;
  timestamp: number;
}

export class CommandStack {
  private stack: CommandEntry[] = [];
  private pointer = -1;
  private maxSize = 200;

  get canUndo(): boolean {
    return this.pointer >= 0;
  }

  get canRedo(): boolean {
    return this.pointer < this.stack.length - 1;
  }

  push(
    description: string,
    operations: LayerOperation[],
    inverse: LayerOperation[],
    snapshot?: LayerTreeState | null,
  ) {
    this.stack = this.stack.slice(0, this.pointer + 1);
    this.stack.push({
      id: crypto.randomUUID(),
      description,
      operations,
      inverse: inverse || [],
      snapshot: snapshot ?? null,
      timestamp: Date.now(),
    });

    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    }
    this.pointer = this.stack.length - 1;
  }

  pushSnapshot(description: string, state: LayerTreeState) {
    const cloned: LayerTreeState = {
      layers: { ...state.layers },
      rootIds: [...state.rootIds],
      selectedIds: new Set(state.selectedIds),
    };
    for (const key of Object.keys(cloned.layers)) {
      cloned.layers[key] = { ...cloned.layers[key], transform: { ...cloned.layers[key].transform }, props: { ...cloned.layers[key].props } };
    }
    this.push(description, [], [], cloned);
  }

  undo(state: LayerTreeState): LayerTreeState {
    if (!this.canUndo) return state;
    const entry = this.stack[this.pointer];
    this.pointer--;

    if (entry.snapshot) return entry.snapshot;

    let result = state;
    for (const op of [...entry.operations].reverse()) {
      result = invertOperation(result, op);
    }
    return result;
  }

  redo(state: LayerTreeState): LayerTreeState {
    if (!this.canRedo) return state;

    this.pointer++;
    const entry = this.stack[this.pointer];

    let result = state;
    for (const op of entry.operations) {
      result = applyOperation(result, op);
    }
    return result;
  }

  clear() {
    this.stack = [];
    this.pointer = -1;
  }

  getHistory(): { id: string; description: string; timestamp: number }[] {
    return this.stack.slice(0, this.pointer + 1).map((e) => ({
      id: e.id,
      description: e.description,
      timestamp: e.timestamp,
    }));
  }
}

function invertOperation(state: LayerTreeState, op: LayerOperation): LayerTreeState {
  switch (op.type) {
    case 'ADD':
      return applyOperation(state, { type: 'REMOVE', layerId: op.layer.id });
    case 'REMOVE':
      return state;
    case 'UPDATE': {
      const layer = state.layers[op.layerId];
      if (!layer) return state;
      const inverted: Record<string, unknown> = {};
      for (const key of Object.keys(op.patch)) {
        inverted[key] = (layer as unknown as Record<string, unknown>)[key];
      }
      return applyOperation(state, { type: 'UPDATE', layerId: op.layerId, patch: inverted as never });
    }
    default:
      return state;
  }
}
