import { BaseTool, type ToolEvent, type ToolContext } from './BaseTool';
import { v4 as uuid } from 'uuid';
import type { Layer } from '@/design-engine/types';

export class ShapeTool extends BaseTool {
  name = 'shape';
  cursor = 'crosshair';
  private shapeType: 'rectangle' | 'ellipse' = 'rectangle';
  private isDrawing = false;
  private startPoint = { x: 0, y: 0 };
  private currentLayerId: string | null = null;

  constructor(shapeType: 'rectangle' | 'ellipse' = 'rectangle') {
    super();
    this.shapeType = shapeType;
    this.name = shapeType;
  }

  onPointerDown(event: ToolEvent, ctx: ToolContext): void {
    this.isDrawing = true;
    this.startPoint = { x: event.canvasX, y: event.canvasY };
    this.currentLayerId = uuid();

    const state = ctx.getLayerState();
    const layer: Layer = {
      id: this.currentLayerId,
      type: this.shapeType,
      name: this.shapeType.charAt(0).toUpperCase() + this.shapeType.slice(1),
      transform: {
        x: event.canvasX,
        y: event.canvasY,
        width: 0,
        height: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      opacity: 1,
      visible: true,
      locked: false,
      parentId: null,
      children: [],
      zIndex: Object.keys(state.layers).length,
      blendMode: 'normal',
      props: { fill: '#6c63ff' },
    };

    ctx.addLayer(layer);
  }

  onPointerMove(event: ToolEvent, ctx: ToolContext): void {
    if (!this.isDrawing || !this.currentLayerId) return;

    const state = ctx.getLayerState();
    const layer = state.layers[this.currentLayerId];
    if (!layer) return;

    const dx = event.canvasX - this.startPoint.x;
    const dy = event.canvasY - this.startPoint.y;
    const x = dx < 0 ? event.canvasX : this.startPoint.x;
    const y = dy < 0 ? event.canvasY : this.startPoint.y;

    ctx.updateLayer(this.currentLayerId, {
      transform: {
        x, y,
        width: Math.abs(dx),
        height: Math.abs(dy),
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
    });
  }

  onPointerUp(_event: ToolEvent, ctx: ToolContext): void {
    if (this.isDrawing && this.currentLayerId) {
      const state = ctx.getLayerState();
      const layer = state.layers[this.currentLayerId];
      if (layer && (layer.transform.width < 2 || layer.transform.height < 2)) {
        ctx.removeLayer(this.currentLayerId);
      } else {
        ctx.pushHistory('Add ' + this.shapeType);
      }
    }
    this.isDrawing = false;
    this.currentLayerId = null;
  }
}
