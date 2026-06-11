import { BaseTool, type ToolEvent, type ToolContext } from './BaseTool';
import { v4 as uuid } from 'uuid';
import type { Layer } from '@/design-engine/types';

export class TextTool extends BaseTool {
  name = 'text';
  cursor = 'text';

  onPointerDown(event: ToolEvent, ctx: ToolContext): void {
    const state = ctx.getLayerState();
    const layer: Layer = {
      id: uuid(),
      type: 'text',
      name: 'Text',
      transform: {
        x: event.canvasX,
        y: event.canvasY,
        width: 200,
        height: 40,
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
      props: {
        text: 'Double-click to edit',
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: 500,
        fill: '#f0f0f5',
        textAlign: 'left',
      },
    };

    ctx.addLayer(layer);
    ctx.pushHistory('Add text');
  }
}
