import { BaseTool, type ToolEvent, type ToolContext } from './BaseTool';
import type { Layer } from '@/design-engine/types';

interface HandleRect {
  x: number;
  y: number;
  cursor: string;
  resize: (dx: number, dy: number, layer: Layer, width: number, height: number) => Partial<Layer>;
}

const HANDLE_SIZE = 8;

function getHandles(layer: Layer): HandleRect[] {
  const t = layer.transform;
  const hw = HANDLE_SIZE / 2;
  return [
    { x: t.x - hw, y: t.y - hw, cursor: 'nwse-resize', resize: (dx, dy, l, w, h) => ({ transform: { ...l.transform, x: l.transform.x + dx, y: l.transform.y + dy, width: w - dx, height: h - dy } }) },
    { x: t.x + t.width / 2 - hw, y: t.y - hw, cursor: 'ns-resize', resize: (_dx, dy, l, _w, h) => ({ transform: { ...l.transform, y: l.transform.y + dy, height: h - dy } }) },
    { x: t.x + t.width - hw, y: t.y - hw, cursor: 'nesw-resize', resize: (dx, dy, l, w, h) => ({ transform: { ...l.transform, y: l.transform.y + dy, width: w + dx, height: h - dy } }) },
    { x: t.x + t.width - hw, y: t.y + t.height / 2 - hw, cursor: 'ew-resize', resize: (dx, _dy, l, w, _h) => ({ transform: { ...l.transform, width: w + dx } }) },
    { x: t.x + t.width - hw, y: t.y + t.height - hw, cursor: 'nwse-resize', resize: (dx, dy, l, w, h) => ({ transform: { ...l.transform, width: w + dx, height: h + dy } }) },
    { x: t.x + t.width / 2 - hw, y: t.y + t.height - hw, cursor: 'ns-resize', resize: (_dx, dy, l, _w, h) => ({ transform: { ...l.transform, height: h + dy } }) },
    { x: t.x - hw, y: t.y + t.height - hw, cursor: 'nesw-resize', resize: (dx, dy, l, w, h) => ({ transform: { ...l.transform, x: l.transform.x + dx, width: w - dx, height: h + dy } }) },
    { x: t.x - hw, y: t.y + t.height / 2 - hw, cursor: 'ew-resize', resize: (dx, _dy, l, w, _h) => ({ transform: { ...l.transform, x: l.transform.x + dx, width: w - dx } }) },
  ];
}

export class SelectTool extends BaseTool {
  name = 'select';
  cursor = 'default';
  private dragStart = { x: 0, y: 0 };
  private isDragging = false;
  private isMarquee = false;
  private marqueeRect: { x: number; y: number; w: number; h: number } | null = null;
  private resizeHandleIndex = -1;
  private resizeStartLayer: Layer | null = null;

  onPointerDown(event: ToolEvent, ctx: ToolContext): void {
    this.dragStart = { x: event.canvasX, y: event.canvasY };
    this.isDragging = false;
    this.isMarquee = false;
    this.resizeHandleIndex = -1;
    this.marqueeRect = null;

    const state = ctx.getLayerState();
    const selectedId = ctx.getSelectedId();

    if (selectedId) {
      const selLayer = state.layers[selectedId];
      if (selLayer) {
        const handles = getHandles(selLayer);
        for (let i = 0; i < handles.length; i++) {
          const h = handles[i];
          if (
            event.canvasX >= h.x && event.canvasX <= h.x + HANDLE_SIZE &&
            event.canvasY >= h.y && event.canvasY <= h.y + HANDLE_SIZE
          ) {
            this.resizeHandleIndex = i;
            this.resizeStartLayer = { ...selLayer, transform: { ...selLayer.transform } };
            return;
          }
        }
      }
    }

    const layers = Object.values(state.layers);
    let hitId: string | null = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible || layer.locked) continue;
      const t = layer.transform;
      if (
        event.canvasX >= t.x && event.canvasX <= t.x + t.width &&
        event.canvasY >= t.y && event.canvasY <= t.y + t.height
      ) {
        hitId = layer.id;
        break;
      }
    }

    if (hitId) {
      if (event.shiftKey) {
        const current = state.selectedIds;
        if (current.has(hitId)) ctx.selectLayer(null);
        else ctx.selectLayer(hitId);
      } else {
        ctx.selectLayer(hitId);
      }
    } else {
      if (!event.shiftKey) ctx.selectLayer(null);
      this.isMarquee = true;
    }
  }

  onPointerMove(event: ToolEvent, ctx: ToolContext): void {
    const state = ctx.getLayerState();
    const selectedId = ctx.getSelectedId();

    if (this.resizeHandleIndex >= 0 && selectedId && this.resizeStartLayer) {
      this.isDragging = true;
      const layer = state.layers[selectedId];
      if (!layer) return;
      const dx = event.canvasX - this.dragStart.x;
      const dy = event.canvasY - this.dragStart.y;
      const t = this.resizeStartLayer.transform;
      const handle = getHandles(this.resizeStartLayer)[this.resizeHandleIndex];
      const patch = handle.resize(dx, dy, this.resizeStartLayer, t.width, t.height);
      ctx.updateLayer(selectedId, patch);
      return;
    }

    if (!this.isDragging) {
      const dx = Math.abs(event.canvasX - this.dragStart.x);
      const dy = Math.abs(event.canvasY - this.dragStart.y);
      if (dx > 3 || dy > 3) this.isDragging = true;
    }

    if (this.isMarquee && this.isDragging) {
      const x = Math.min(event.canvasX, this.dragStart.x);
      const y = Math.min(event.canvasY, this.dragStart.y);
      const w = Math.abs(event.canvasX - this.dragStart.x);
      const h = Math.abs(event.canvasY - this.dragStart.y);
      this.marqueeRect = { x, y, w, h };
    }
  }

  onPointerUp(_event: ToolEvent, ctx: ToolContext): void {
    if (this.resizeHandleIndex >= 0 && this.isDragging) {
      ctx.pushHistory('Resize layer');
    }

    if (this.isMarquee && this.marqueeRect) {
      const state = ctx.getLayerState();
      const mr = this.marqueeRect;
      const layers = Object.values(state.layers);
      for (const layer of layers) {
        if (!layer.visible || layer.locked) continue;
        if (layer.type === 'group') continue;
        const t = layer.transform;
        if (
          t.x >= mr.x && t.x + t.width <= mr.x + mr.w &&
          t.y >= mr.y && t.y + t.height <= mr.y + mr.h
        ) {
          ctx.selectLayer(layer.id);
          break;
        }
      }
    }

    this.isDragging = false;
    this.isMarquee = false;
    this.marqueeRect = null;
    this.resizeHandleIndex = -1;
    this.resizeStartLayer = null;
  }
}

export { getHandles, HANDLE_SIZE };
