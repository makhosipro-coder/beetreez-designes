import type { CanvasViewport } from '@/design-engine/types';

export class ViewportManager {
  private viewport: CanvasViewport = { x: 0, y: 0, zoom: 1 };
  private minZoom = 0.1;
  private maxZoom = 10;

  getViewport(): CanvasViewport {
    return { ...this.viewport };
  }

  setViewport(vp: Partial<CanvasViewport>): CanvasViewport {
    this.viewport = { ...this.viewport, ...vp };
    this.viewport.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.viewport.zoom));
    return this.getViewport();
  }

  zoomIn(factor = 1.2): CanvasViewport {
    return this.setViewport({ zoom: this.viewport.zoom * factor });
  }

  zoomOut(factor = 1.2): CanvasViewport {
    return this.setViewport({ zoom: this.viewport.zoom / factor });
  }

  zoomToFit(
    canvasWidth: number,
    canvasHeight: number,
    containerWidth: number,
    containerHeight: number,
    padding = 40,
  ): CanvasViewport {
    const scaleX = (containerWidth - padding * 2) / canvasWidth;
    const scaleY = (containerHeight - padding * 2) / canvasHeight;
    const zoom = Math.min(scaleX, scaleY, 1);
    const x = (containerWidth - canvasWidth * zoom) / 2;
    const y = (containerHeight - canvasHeight * zoom) / 2;
    return this.setViewport({ x, y, zoom });
  }

  pan(dx: number, dy: number): CanvasViewport {
    return this.setViewport({
      x: this.viewport.x + dx,
      y: this.viewport.y + dy,
    });
  }

  screenToCanvas(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - this.viewport.x) / this.viewport.zoom,
      y: (sy - this.viewport.y) / this.viewport.zoom,
    };
  }

  canvasToScreen(cx: number, cy: number): { x: number; y: number } {
    return {
      x: cx * this.viewport.zoom + this.viewport.x,
      y: cy * this.viewport.zoom + this.viewport.y,
    };
  }
}
