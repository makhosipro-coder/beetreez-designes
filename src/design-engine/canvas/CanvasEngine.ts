import type { Layer, CanvasViewport, Point } from '@/design-engine/types';
import type { BlendMode } from '@/design-engine/types';
import { buildDocumentTree } from '@/design-engine/layers';
import type { LayerTreeState } from '@/design-engine/layers';
import type { SnapGuide } from '@/utils/design/alignment';
import type { CursorPosition } from '@/lib/collab-types';

const BLEND_MAP: Record<BlendMode, GlobalCompositeOperation> = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
};

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private viewport: CanvasViewport = { x: 0, y: 0, zoom: 1 };
  private dirty = true;
  private dpr = 1;
  private imageCache = new Map<string, HTMLImageElement>();
  private pendingImages = new Set<string>();

  constructor(canvas: HTMLCanvasElement, width?: number, height?: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;
    if (width && height) {
      this.canvas.width = width * this.dpr;
      this.canvas.height = height * this.dpr;
    } else {
      this.resize();
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.dirty = true;
  }

  setViewport(vp: Partial<CanvasViewport>) {
    this.viewport = { ...this.viewport, ...vp };
    this.dirty = true;
  }

  getViewport(): CanvasViewport {
    return { ...this.viewport };
  }

  pan(dx: number, dy: number) {
    this.viewport.x += dx;
    this.viewport.y += dy;
    this.dirty = true;
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

  render(layerState: LayerTreeState, guides?: SnapGuide[], cursors?: CursorPosition[]) {
    this.dirty = true;
    this.drawFrame(layerState, guides, cursors);
  }

  private drawFrame(layerState: LayerTreeState, guides?: SnapGuide[], cursors?: CursorPosition[]) {
    if (!this.dirty) return;
    const ctx = this.ctx;
    const vp = this.viewport;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(vp.x, vp.y);
    ctx.scale(vp.zoom, vp.zoom);

    this.drawGrid(ctx);
    this.drawDesignBounds(ctx);
    if (guides && guides.length > 0) this.drawGuides(ctx, guides);
    this.drawLayers(ctx, layerState);
    if (cursors && cursors.length > 0) this.drawRemoteCursors(ctx, cursors);

    ctx.restore();
    this.dirty = false;
  }

  private drawRemoteCursors(ctx: CanvasRenderingContext2D, cursors: CursorPosition[]) {
    const zoom = this.viewport.zoom;
    for (const c of cursors) {
      ctx.save();
      ctx.translate(c.x, c.y);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8 / zoom, 20 / zoom);
      ctx.lineTo(16 / zoom, 8 / zoom);
      ctx.closePath();
      ctx.fillStyle = c.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 4 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      ctx.fillStyle = c.color;
      ctx.font = `bold ${11 / zoom}px system-ui, sans-serif`;
      ctx.textBaseline = 'top';
      const textW = ctx.measureText(c.name).width + 8 / zoom;
      const rx = 3 / zoom;
      const tx = 16 / zoom;
      const ty = 8 / zoom;
      ctx.beginPath();
      ctx.roundRect(tx, ty, textW, 18 / zoom, rx);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.fillText(c.name, tx + 4 / zoom, ty + 4 / zoom);

      ctx.restore();
    }
  }

  private drawDesignBounds(ctx: CanvasRenderingContext2D) {
    const w = 1920;
    const h = 1080;
    ctx.strokeStyle = 'rgba(108, 99, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(0, 0, w, h);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(0, 0, w, h);
  }

  private drawGuides(ctx: CanvasRenderingContext2D, guides: SnapGuide[]) {
    ctx.save();
    for (const g of guides) {
      ctx.strokeStyle = g.color || '#6c63ff';
      ctx.lineWidth = 1 / this.viewport.zoom;
      ctx.setLineDash([4 / this.viewport.zoom, 4 / this.viewport.zoom]);
      ctx.beginPath();
      if (g.axis === 'v') {
        ctx.moveTo(g.pos, 0);
        ctx.lineTo(g.pos, 1080);
      } else {
        ctx.moveTo(0, g.pos);
        ctx.lineTo(1920, g.pos);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    const gridSize = 20;
    const vpGridSize = gridSize * this.viewport.zoom;
    if (vpGridSize < 4) return;

    const docW = 1920;
    const docH = 1080;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, docW, docH);
    ctx.clip();

    const offsetX = this.viewport.x % vpGridSize;
    const offsetY = this.viewport.y % vpGridSize;
    const screenW = this.canvas.width / this.dpr;
    const screenH = this.canvas.height / this.dpr;

    ctx.strokeStyle = 'rgba(42, 42, 74, 0.5)';
    ctx.lineWidth = 1;

    for (let x = offsetX - vpGridSize; x < screenW; x += vpGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, screenH);
      ctx.stroke();
    }
    for (let y = offsetY - vpGridSize; y < screenH; y += vpGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(screenW, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private getVisibleViewport(): { x: number; y: number; w: number; h: number } {
    const vp = this.viewport;
    const screenW = this.canvas.width / this.dpr;
    const screenH = this.canvas.height / this.dpr;
    return {
      x: (-vp.x) / vp.zoom,
      y: (-vp.y) / vp.zoom,
      w: screenW / vp.zoom,
      h: screenH / vp.zoom,
    };
  }

  private isLayerVisibleInViewport(layer: Layer, viewport: { x: number; y: number; w: number; h: number }): boolean {
    const t = layer.transform;
    return !(
      t.x + t.width < viewport.x ||
      t.x > viewport.x + viewport.w ||
      t.y + t.height < viewport.y ||
      t.y > viewport.y + viewport.h
    );
  }

  private drawLayers(ctx: CanvasRenderingContext2D, layerState: LayerTreeState) {
    const tree = buildDocumentTree(layerState);
    const viewport = this.getVisibleViewport();
    for (const layer of tree) {
      if (!layer.visible) continue;
      if (!this.isLayerVisibleInViewport(layer, viewport)) continue;
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = BLEND_MAP[layer.blendMode] || 'source-over';
      this.drawLayer(ctx, layer, layerState);
      ctx.restore();

      if (layerState.selectedIds.has(layer.id)) {
        this.drawSelectionOverlay(ctx, layer);
      }
    }
  }

  private drawSelectionOverlay(ctx: CanvasRenderingContext2D, layer: Layer) {
    const t = layer.transform;
    const z = this.viewport.zoom;
    const hs = 4 / z;

    ctx.save();
    ctx.strokeStyle = '#6c63ff';
    ctx.lineWidth = 2 / z;
    ctx.setLineDash([4 / z, 4 / z]);
    ctx.strokeRect(t.x, t.y, t.width, t.height);
    ctx.setLineDash([]);

    ctx.fillStyle = '#6c63ff';
    const cx = t.x + t.width / 2;
    const cy = t.y + t.height / 2;

    const handles = [
      { x: t.x, y: t.y },
      { x: cx, y: t.y },
      { x: t.x + t.width, y: t.y },
      { x: t.x + t.width, y: cy },
      { x: t.x + t.width, y: t.y + t.height },
      { x: cx, y: t.y + t.height },
      { x: t.x, y: t.y + t.height },
      { x: t.x, y: cy },
    ];

    for (const h of handles) {
      ctx.fillRect(h.x - hs, h.y - hs, hs * 2, hs * 2);
    }

    ctx.restore();
  }

  private drawLayer(ctx: CanvasRenderingContext2D, layer: Layer, layerState: LayerTreeState) {
    const t = layer.transform;
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate((t.rotation * Math.PI) / 180);
    ctx.scale(t.scaleX, t.scaleY);

    if (layer.type === 'group') {
      for (const childId of layer.children) {
        const child = layerState.layers[childId];
        if (child && child.visible) {
          this.drawLayer(ctx, child, layerState);
        }
      }
    } else {
      this.applyShadows(ctx, layer);
      this.drawShape(ctx, layer);
    }

    ctx.restore();
  }

  private applyShadows(ctx: CanvasRenderingContext2D, layer: Layer) {
    const p = layer.props;
    if (p.shadowColor) {
      ctx.shadowColor = p.shadowColor as string;
      ctx.shadowBlur = (p.shadowBlur as number) || 4;
      ctx.shadowOffsetX = (p.shadowOffsetX as number) || 0;
      ctx.shadowOffsetY = (p.shadowOffsetY as number) || 0;
    }
  }

  private drawShape(ctx: CanvasRenderingContext2D, layer: Layer) {
    const { width, height } = layer.transform;
    const p = layer.props;
    const fill = p.fill as string | undefined;
    const gradientDef = p.gradient as
      | { type: 'linear' | 'radial'; angle?: number; stops: Array<{ offset: number; color: string }> }
      | undefined;

    let hasPath = false;

    switch (layer.type) {
      case 'rectangle': {
        const r = (p.cornerRadius as number) || 0;
        ctx.beginPath();
        if (r > 0) ctx.roundRect(0, 0, width, height, r);
        else ctx.rect(0, 0, width, height);
        hasPath = true;
        this.applyFill(ctx, fill, gradientDef, width, height, true);
        ctx.fill();
        this.applyStroke(ctx, p, true);
        break;
      }
      case 'ellipse': {
        ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
        hasPath = true;
        this.applyFill(ctx, fill, gradientDef, width, height, true);
        ctx.fill();
        this.applyStroke(ctx, p, true);
        break;
      }
      case 'text': {
        ctx.fillStyle = fill || '#f0f0f5';
        ctx.font = `${(p.fontSize as number) || 16}px ${(p.fontFamily as string) || 'Inter'}`;
        ctx.fillText((p.text as string) || '', 0, 16);
        break;
      }
      case 'image': {
        const imageSrc = p.imageSrc as string | undefined;
        const cached = imageSrc ? this.imageCache.get(imageSrc) : null;
        if (cached) {
          ctx.drawImage(cached, 0, 0, width, height);
        } else if (imageSrc && !this.pendingImages.has(imageSrc)) {
          this.pendingImages.add(imageSrc);
          const img = new Image();
          img.onload = () => {
            this.imageCache.set(imageSrc, img);
            this.pendingImages.delete(imageSrc);
            this.dirty = true;
          };
          img.onerror = () => { this.pendingImages.delete(imageSrc); };
          img.src = imageSrc;
          ctx.fillStyle = '#2a2a4a';
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.fillStyle = '#2a2a4a';
          ctx.fillRect(0, 0, width, height);
        }
        break;
      }
      case 'line': {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, height);
        ctx.strokeStyle = (p.strokeColor as string) || '#6c63ff';
        ctx.lineWidth = (p.strokeWidth as number) || 2;
        if (p.lineDash) ctx.setLineDash(p.lineDash as number[]);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      case 'polygon': {
        const pts = p.points as Point[] | undefined;
        if (pts && pts.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          hasPath = true;
          this.applyFill(ctx, fill, gradientDef, width, height, true);
          ctx.fill();
          this.applyStroke(ctx, p, true);
        } else {
          ctx.fillStyle = fill || '#4a4a6a';
          ctx.fillRect(0, 0, width, height);
        }
        break;
      }
      default:
        ctx.fillStyle = fill || '#4a4a6a';
        ctx.fillRect(0, 0, width, height);
    }
  }

  private applyFill(
    ctx: CanvasRenderingContext2D,
    fill: string | undefined,
    gradient:
      | { type: 'linear' | 'radial'; angle?: number; stops: Array<{ offset: number; color: string }> }
      | undefined,
    w: number,
    h: number,
    hasPath: boolean,
  ) {
    if (gradient && gradient.stops && gradient.stops.length > 0) {
      const angle = (gradient.angle || 0) * (Math.PI / 180);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const cx = w / 2;
      const cy = h / 2;
      const dx = Math.abs(w * cos) + Math.abs(h * sin);
      const dy = Math.abs(w * sin) + Math.abs(h * cos);
      const g = ctx.createLinearGradient(cx - dx / 2, cy - dy / 2, cx + dx / 2, cy + dy / 2);
      for (const stop of gradient.stops) {
        g.addColorStop(stop.offset, stop.color);
      }
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = fill || '#4a4a6a';
    }
  }

  private applyStroke(ctx: CanvasRenderingContext2D, p: Record<string, unknown>, hasPath: boolean) {
    const strokeColor = p.strokeColor as string | undefined;
    const strokeWidth = p.strokeWidth as number | undefined;
    if (strokeColor && strokeWidth && hasPath) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      const dash = p.strokeDasharray as number[] | undefined;
      if (dash && dash.length > 0) ctx.setLineDash(dash);
      ctx.stroke();
      if (dash && dash.length > 0) ctx.setLineDash([]);
    }
  }

  hitTest(layerState: LayerTreeState, canvasX: number, canvasY: number): Layer | null {
    const tree = buildDocumentTree(layerState);
    for (let i = tree.length - 1; i >= 0; i--) {
      const layer = tree[i];
      if (!layer.visible || layer.locked) continue;
      const t = layer.transform;
      if (
        canvasX >= t.x &&
        canvasX <= t.x + t.width &&
        canvasY >= t.y &&
        canvasY <= t.y + t.height
      ) {
        return layer;
      }
    }
    return null;
  }

  destroy() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
