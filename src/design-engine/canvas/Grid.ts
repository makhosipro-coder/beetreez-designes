import type { Point } from '@/design-engine/types';

export interface GridConfig {
  size: number;
  subdivisions: number;
  color: string;
  subdivisionColor: string;
  showGrid: boolean;
  snapToGrid: boolean;
}

export const DEFAULT_GRID: GridConfig = {
  size: 20,
  subdivisions: 4,
  color: 'rgba(42, 42, 74, 0.5)',
  subdivisionColor: 'rgba(42, 42, 74, 0.2)',
  showGrid: true,
  snapToGrid: true,
};

export class GridManager {
  private config: GridConfig = { ...DEFAULT_GRID };

  getConfig(): GridConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<GridConfig>) {
    this.config = { ...this.config, ...config };
  }

  snap(point: Point): Point {
    if (!this.config.snapToGrid) return point;
    return {
      x: Math.round(point.x / this.config.size) * this.config.size,
      y: Math.round(point.y / this.config.size) * this.config.size,
    };
  }

  draw(ctx: CanvasRenderingContext2D, viewportX: number, viewportY: number, zoom: number) {
    if (!this.config.showGrid) return;

    const gridSize = this.config.size * zoom;
    if (gridSize < 4) return;

    const offsetX = viewportX % gridSize;
    const offsetY = viewportY % gridSize;
    const bounds = ctx.canvas.getBoundingClientRect();

    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 1;

    for (let x = offsetX - gridSize; x < bounds.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, bounds.height);
      ctx.stroke();
    }
    for (let y = offsetY - gridSize; y < bounds.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(bounds.width, y);
      ctx.stroke();
    }
  }
}
