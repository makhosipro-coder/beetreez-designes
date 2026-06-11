import { BaseTool, type ToolEvent, type ToolContext } from './BaseTool';
import { v4 as uuid } from 'uuid';
import type { Layer } from '@/design-engine/types';

export class ImageTool extends BaseTool {
  name = 'image';
  cursor = 'crosshair';
  private fileInput: HTMLInputElement | null = null;
  private pendingEvent: ToolEvent | null = null;

  onActivate(): void {
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/png,image/jpeg,image/webp,image/svg+xml';
    this.fileInput.style.display = 'none';
    document.body.appendChild(this.fileInput);
  }

  onDeactivate(): void {
    if (this.fileInput) {
      document.body.removeChild(this.fileInput);
      this.fileInput = null;
    }
  }

  private async uploadImage(blob: Blob, fileName: string): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', blob, fileName);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) return null;
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  }

  onPointerDown(event: ToolEvent, ctx: ToolContext): void {
    if (!this.fileInput) return;
    this.pendingEvent = event;

    this.fileInput.onchange = () => {
      const file = this.fileInput?.files?.[0];
      if (!file || !this.pendingEvent) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const worker = new Worker('/workers/image-worker.js');
        const id = uuid();
        worker.postMessage({ dataUrl, id, maxDim: 400 });

        worker.onmessage = async (e) => {
          if (e.data.id !== id || e.data.error) {
            worker.terminate();
            return;
          }
          const resizedSrc = e.data.dataUrl;
          worker.terminate();

          const tempImg = new Image();
          tempImg.onload = async () => {
            let imageSrc = resizedSrc;
            const blob = await fetch(resizedSrc).then((r) => r.blob()).catch(() => null);
            if (blob) {
              const uploadedUrl = await this.uploadImage(blob, file!.name);
              if (uploadedUrl) imageSrc = uploadedUrl;
            }

            const layer: Layer = {
              id: uuid(),
              type: 'image',
              name: file!.name,
              transform: {
                x: this.pendingEvent!.canvasX,
                y: this.pendingEvent!.canvasY,
                width: tempImg.naturalWidth,
                height: tempImg.naturalHeight,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
              },
              opacity: 1,
              visible: true,
              locked: false,
              parentId: null,
              children: [],
              zIndex: Object.keys(ctx.getLayerState().layers).length,
              blendMode: 'normal',
              props: { imageSrc },
            };
            ctx.addLayer(layer);
            ctx.pushHistory('Add image');
          };
          tempImg.src = resizedSrc;
        };
      };
      reader.readAsDataURL(file);
      this.fileInput!.value = '';
    };

    this.fileInput.click();
  }
}
