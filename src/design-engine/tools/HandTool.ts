import { BaseTool, type ToolEvent, type ToolContext } from './BaseTool';

export class HandTool extends BaseTool {
  name = 'hand';
  cursor = 'grab';
  private isPanning = false;
  private lastPos = { x: 0, y: 0 };
  private onPan: ((dx: number, dy: number) => void) | null = null;

  setPanCallback(cb: (dx: number, dy: number) => void) {
    this.onPan = cb;
  }

  onPointerDown(event: ToolEvent, _ctx: ToolContext): void {
    this.isPanning = true;
    this.lastPos = { x: event.screenX, y: event.screenY };
  }

  onPointerMove(event: ToolEvent, _ctx: ToolContext): void {
    if (!this.isPanning) return;
    const dx = event.screenX - this.lastPos.x;
    const dy = event.screenY - this.lastPos.y;
    this.lastPos = { x: event.screenX, y: event.screenY };
    this.onPan?.(dx, dy);
  }

  onPointerUp(_event: ToolEvent, _ctx: ToolContext): void {
    this.isPanning = false;
  }
}
