import type { Layer } from '@/design-engine/types';
import type { LayerTreeState } from '@/design-engine/layers';
import { buildDocumentTree } from '@/design-engine/layers';

function layerToSvg(layer: Layer, state: LayerTreeState): string {
  const t = layer.transform;
  const p = layer.props;
  const fill = (p.fill as string) || 'none';

  if (layer.type === 'group') {
    const children = layer.children.map((id) => {
      const child = state.layers[id];
      return child ? layerToSvg(child, state) : '';
    }).join('\n');
    return `<g transform="translate(${t.x},${t.y}) rotate(${t.rotation}) scale(${t.scaleX},${t.scaleY})">\n${children}\n</g>`;
  }

  let el = '';
  const attrs = [
    `transform="translate(${t.x},${t.y}) rotate(${t.rotation}) scale(${t.scaleX},${t.scaleY})"`,
    `opacity="${layer.opacity}"`,
  ];

  switch (layer.type) {
    case 'rectangle': {
      const rx = (p.cornerRadius as number) || 0;
      el = `<rect width="${t.width}" height="${t.height}" rx="${rx}" fill="${fill}"`;
      if (p.strokeColor) el += ` stroke="${p.strokeColor}" stroke-width="${p.strokeWidth || 1}"`;
      break;
    }
    case 'ellipse':
      el = `<ellipse cx="${t.width / 2}" cy="${t.height / 2}" rx="${t.width / 2}" ry="${t.height / 2}" fill="${fill}"`;
      if (p.strokeColor) el += ` stroke="${p.strokeColor}" stroke-width="${p.strokeWidth || 1}"`;
      break;
    case 'text': {
      const fontSize = (p.fontSize as number) || 16;
      const fontFamily = (p.fontFamily as string) || 'Inter';
      el = `<text font-size="${fontSize}" font-family="${fontFamily}" fill="${fill}"><tspan x="0" y="${fontSize}">${escapeXml((p.text as string) || '')}</tspan></text>`;
      break;
    }
    case 'line':
      el = `<line x1="0" y1="0" x2="${t.width}" y2="${t.height}" stroke="${(p.strokeColor as string) || '#6c63ff'}" stroke-width="${(p.strokeWidth as number) || 2}"`;
      break;
    case 'polygon': {
      const pts = p.points as Array<{ x: number; y: number }> | undefined;
      if (pts && pts.length >= 2) {
        const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' ') + ' Z';
        el = `<path d="${d}" fill="${fill}"`;
        if (p.strokeColor) el += ` stroke="${p.strokeColor}" stroke-width="${p.strokeWidth || 1}"`;
      } else {
        el = `<rect width="${t.width}" height="${t.height}" fill="${fill}"`;
      }
      break;
    }
    case 'image': {
      const src = p.imageSrc as string | undefined;
      if (src) el = `<image href="${src}" width="${t.width}" height="${t.height}" preserveAspectRatio="xMidYMid slice"`;
      else el = `<rect width="${t.width}" height="${t.height}" fill="#2a2a4a"`;
      break;
    }
    default:
      el = `<rect width="${t.width}" height="${t.height}" fill="${fill}"`;
  }

  return `<${el} ${attrs.join(' ')} />`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function exportToSvg(layerState: LayerTreeState, width = 1920, height = 1080): string {
  const tree = buildDocumentTree(layerState);
  const elements = tree
    .filter((l) => l.visible && l.type !== 'group')
    .map((l) => layerToSvg(l, layerState))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${elements}
</svg>`;
}

export function downloadSvg(layerState: LayerTreeState, filename: string, width?: number, height?: number) {
  const svg = exportToSvg(layerState, width, height);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}
