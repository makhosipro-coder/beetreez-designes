import type { Layer, Bounds } from '@/design-engine/types';
import type { LayerTreeState } from '@/design-engine/layers';

export interface ToolEvent {
  canvasX: number;
  canvasY: number;
  screenX: number;
  screenY: number;
  originalEvent: PointerEvent;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
}

export interface ToolContext {
  getLayerState: () => LayerTreeState;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  getSelectedId: () => string | null;
  pushHistory: (description: string) => void;
}

export abstract class BaseTool {
  abstract name: string;
  abstract cursor: string;

  onActivate?(_ctx: ToolContext): void;
  onDeactivate?(): void;
  onPointerDown?(_event: ToolEvent, _ctx: ToolContext): void;
  onPointerMove?(_event: ToolEvent, _ctx: ToolContext): void;
  onPointerUp?(_event: ToolEvent, _ctx: ToolContext): void;
  onDoubleClick?(_event: ToolEvent, _ctx: ToolContext): void;
}
