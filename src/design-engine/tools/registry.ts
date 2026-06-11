import { BaseTool } from './BaseTool';
import type { ToolContext } from './BaseTool';
import { SelectTool } from './SelectTool';
import { MoveTool } from './MoveTool';
import { ShapeTool } from './ShapeTool';
import { TextTool } from './TextTool';
import { ImageTool } from './ImageTool';
import { HandTool } from './HandTool';

export type ToolName = 'select' | 'move' | 'hand' | 'rectangle' | 'ellipse' | 'text' | 'image';

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();
  private activeTool: BaseTool | null = null;

  constructor() {
    this.register('select', new SelectTool());
    this.register('move', new MoveTool());
    this.register('hand', new HandTool());
    this.register('rectangle', new ShapeTool('rectangle'));
    this.register('ellipse', new ShapeTool('ellipse'));
    this.register('text', new TextTool());
    this.register('image', new ImageTool());
  }

  private register(name: string, tool: BaseTool) {
    this.tools.set(name, tool);
  }

  getTool(name: string): BaseTool {
    return this.tools.get(name) || this.tools.get('select')!;
  }

  activate(name: string, ctx: ToolContext) {
    if (this.activeTool) {
      this.activeTool.onDeactivate?.();
    }
    const tool = this.getTool(name);
    tool.onActivate?.(ctx);
    this.activeTool = tool;
  }

  getActiveTool(): BaseTool | null {
    return this.activeTool;
  }

  getCursor(name: string): string {
    return this.getTool(name).cursor;
  }
}

export const toolRegistry = new ToolRegistry();
