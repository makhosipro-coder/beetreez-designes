import { BaseTool, type ToolEvent, type ToolContext } from './BaseTool';
import { computeSnap } from '@/utils/design/alignment';

export class MoveTool extends BaseTool {
  name = 'move';
  cursor = 'move';
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private movingId: string | null = null;
  private startPos = { x: 0, y: 0 };
  private snapEnabled = false;
  private guides: import('@/utils/design/alignment').SnapGuide[] = [];

  onPointerDown(event: ToolEvent, ctx: ToolContext): void {
    this.movingId = ctx.getSelectedId();
    this.isDragging = false;
    this.guides = [];

    if (!this.movingId) {
      const state = ctx.getLayerState();
      const layers = Object.values(state.layers);
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        if (!layer.visible || layer.locked) continue;
        const t = layer.transform;
        if (
          event.canvasX >= t.x && event.canvasX <= t.x + t.width &&
          event.canvasY >= t.y && event.canvasY <= t.y + t.height
        ) {
          this.movingId = layer.id;
          ctx.selectLayer(layer.id);
          break;
        }
      }
    }

    if (!this.movingId) return;

    const state = ctx.getLayerState();
    const layer = state.layers[this.movingId];
    if (!layer || layer.locked) {
      this.movingId = null;
      return;
    }

    this.dragOffset = {
      x: event.canvasX - layer.transform.x,
      y: event.canvasY - layer.transform.y,
    };
    this.startPos = { x: layer.transform.x, y: layer.transform.y };
  }

  onPointerMove(event: ToolEvent, ctx: ToolContext): void {
    if (!this.movingId) return;

    if (!this.isDragging) {
      const dx = Math.abs(event.canvasX - this.dragOffset.x - this.startPos.x);
      const dy = Math.abs(event.canvasY - this.dragOffset.y - this.startPos.y);
      if (dx > 1 || dy > 1) this.isDragging = true;
    }

    if (!this.isDragging) return;

    const state = ctx.getLayerState();
    const layer = state.layers[this.movingId];
    if (!layer) return;

    let targetX = event.canvasX - this.dragOffset.x;
    let targetY = event.canvasY - this.dragOffset.y;
    this.guides = [];

    if (this.snapEnabled) {
      const snapResult = computeSnap(
        targetX, targetY, layer.transform.width, layer.transform.height,
        Object.values(state.layers), this.movingId, 20, false
      );
      targetX = snapResult.x;
      targetY = snapResult.y;
      this.guides = snapResult.guides;
    }

    ctx.updateLayer(this.movingId, {
      transform: {
        ...layer.transform,
        x: targetX,
        y: targetY,
      },
    });
  }

  getActiveGuides() { return this.guides; }
  setSnapEnabled(enabled: boolean) { this.snapEnabled = enabled; }

  onPointerUp(_event: ToolEvent, ctx: ToolContext): void {
    if (this.isDragging && this.movingId) {
      ctx.pushHistory('Move layer');
    }
    this.isDragging = false;
    this.movingId = null;
  }
}
