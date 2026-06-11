import { useDesignStore } from '@/stores/designStore';
import { buildDocumentTree } from '@/design-engine/layers';
import type { Layer } from '@/design-engine/types';
import { Square, Circle, Type, Image, Folder, Minus, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

function LayerItem({ layer, depth = 0 }: { layer: Layer; depth?: number }) {
  const selectLayer = useDesignStore((s) => s.selectLayer);
  const toggleLayerVisibility = useDesignStore((s) => s.toggleLayerVisibility);
  const toggleLayerLock = useDesignStore((s) => s.toggleLayerLock);
  const selectedIds = useDesignStore((s) => s.layerState.selectedIds);
  const isSelected = selectedIds.has(layer.id);
  const allLayers = useDesignStore((s) => s.layerState.layers);

  const TypeIcon = ({
    rectangle: Square,
    ellipse: Circle,
    text: Type,
    image: Image,
    group: Folder,
    line: Minus,
    polygon: Square,
  } as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[layer.type] || Square;

  return (
    <div>
      <button
        type="button"
        role="listitem"
        aria-selected={isSelected}
        className={`group flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-hover ${
          isSelected ? 'bg-accent/10 text-accent' : 'text-text-secondary'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => selectLayer(layer.id)}
      >
        <TypeIcon size={14} className="shrink-0 opacity-60" />
        <span className="flex-1 truncate text-left text-xs">{layer.name}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
          aria-label={`${layer.visible ? 'Hide' : 'Show'} ${layer.name}`}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          {layer.visible ? <Eye size={13} className="text-text-tertiary" /> : <EyeOff size={13} className="text-danger" />}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
          aria-label={`${layer.locked ? 'Unlock' : 'Lock'} ${layer.name}`}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          {layer.locked ? <Lock size={13} className="text-warning" /> : <Unlock size={13} className="text-text-tertiary" />}
        </button>
      </button>
      {layer.type === 'group' && layer.children.map((childId) => {
        const child = allLayers[childId];
        if (!child) return null;
        return <LayerItem key={childId} layer={child} depth={depth + 1} />;
      })}
    </div>
  );
}

export function LayerPanel() {
  const layerState = useDesignStore((s) => s.layerState);
  const selectedLayer = useDesignStore((s) => s.getSelectedLayer());
  const layers = buildDocumentTree(layerState);

  return (
    <div className="border-b border-border py-2">
      <div className="panel-header">
        <span>{selectedLayer ? 'Element Properties' : 'Layers'}</span>
        {selectedLayer && (
          <span className="rounded bg-grid px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
            {selectedLayer.type}
          </span>
        )}
      </div>
      <div className="mt-1">
        {layers.length === 0 ? (
          <p role="status" aria-live="polite" className="px-3 py-8 text-center text-xs text-text-tertiary">
            No layers yet. Use the tools to add elements.
          </p>
        ) : (
          <div role="list">
            {layers.map((layer) => <LayerItem key={layer.id} layer={layer} />)}
          </div>
        )}
      </div>
    </div>
  );
}
