import type { LayerTreeState } from '@/design-engine/layers';
import { CanvasEngine } from '@/design-engine/canvas';

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportOptions {
  format: ExportFormat;
  quality: number;
  width: number;
  height: number;
  background: string;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png',
  quality: 0.92,
  width: 1920,
  height: 1080,
  background: '#ffffff',
};

export class ExportEngine {
  export(
    layerState: LayerTreeState,
    options: Partial<ExportOptions> = {},
  ): Promise<Blob> {
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = opts.width;
        canvas.height = opts.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.fillStyle = opts.background;
        ctx.fillRect(0, 0, opts.width, opts.height);

        const engine = new CanvasEngine(canvas, opts.width, opts.height);
        engine.render(layerState);

        canvas.toBlob(
          (blob) => {
            engine.destroy();
            if (blob) resolve(blob);
            else reject(new Error('Export failed'));
          },
          `image/${opts.format}`,
          opts.quality,
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  async exportAsDataUrl(
    layerState: LayerTreeState,
    options: Partial<ExportOptions> = {},
  ): Promise<string> {
    const blob = await this.export(layerState, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async download(
    layerState: LayerTreeState,
    filename: string,
    options: Partial<ExportOptions> = {},
  ) {
    const blob = await this.export(layerState, options);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async generateThumbnail(
    layerState: LayerTreeState,
    width = 400,
    height = 225,
  ): Promise<string> {
    const blob = await this.export(layerState, { format: 'jpeg', quality: 0.6, width, height, background: '#ffffff' });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
