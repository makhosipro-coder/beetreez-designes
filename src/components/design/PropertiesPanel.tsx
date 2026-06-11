import { useDesignStore } from '@/stores/designStore';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from './ColorPicker';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import type { Layer, BlendMode } from '@/design-engine/types';

const BLEND_OPTIONS: Array<{ value: BlendMode; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
];

function PositionSection({ layer }: { layer: Layer }) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  const t = layer.transform;

  const set = (key: string, val: number) => {
    updateLayer(layer.id, { transform: { ...t, [key]: val } });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">X</label>
          <input type="number" value={Math.round(t.x)} onChange={(e) => set('x', Number(e.target.value))} className="input text-xs h-7" />
        </div>
        <div>
          <label className="label">Y</label>
          <input type="number" value={Math.round(t.y)} onChange={(e) => set('y', Number(e.target.value))} className="input text-xs h-7" />
        </div>
        <div>
          <label className="label">W</label>
          <input type="number" value={Math.round(t.width)} onChange={(e) => set('width', Number(e.target.value))} className="input text-xs h-7" />
        </div>
        <div>
          <label className="label">H</label>
          <input type="number" value={Math.round(t.height)} onChange={(e) => set('height', Number(e.target.value))} className="input text-xs h-7" />
        </div>
      </div>
      <div>
        <label className="label">Rotation</label>
        <Slider value={t.rotation} onChange={(v) => set('rotation', v)} min={0} max={360} />
      </div>
      <div>
        <label className="label">Opacity</label>
        <Slider value={Math.round(layer.opacity * 100)} onChange={(v) => updateLayer(layer.id, { opacity: v / 100 })} min={0} max={100} />
      </div>
    </div>
  );
}

function FillSection({ layer }: { layer: Layer }) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  const fill = (layer.props.fill as string) || '#6366F1';

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Fill Color</label>
        <ColorPicker value={fill} onChange={(c) => updateLayer(layer.id, { props: { ...layer.props, fill: c } })} />
      </div>
    </div>
  );
}

function StrokeSection({ layer }: { layer: Layer }) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  const strokeColor = (layer.props.strokeColor as string) || '';
  const strokeWidth = (layer.props.strokeWidth as number) || 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Stroke Color</label>
        <ColorPicker value={strokeColor || '#ffffff'} onChange={(c) => updateLayer(layer.id, { props: { ...layer.props, strokeColor: c } })} />
      </div>
      <div>
        <label className="label">Stroke Width</label>
        <Slider value={strokeWidth} onChange={(v) => updateLayer(layer.id, { props: { ...layer.props, strokeWidth: v } })} min={0} max={20} />
      </div>
    </div>
  );
}

function ShadowSection({ layer }: { layer: Layer }) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  const shadowColor = (layer.props.shadowColor as string) || '#000000';
  const shadowBlur = (layer.props.shadowBlur as number) || 10;
  const shadowOffsetX = (layer.props.shadowOffsetX as number) || 0;
  const shadowOffsetY = (layer.props.shadowOffsetY as number) || 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Shadow Color</label>
        <ColorPicker value={shadowColor} onChange={(c) => updateLayer(layer.id, { props: { ...layer.props, shadowColor: c } })} />
      </div>
      <div>
        <label className="label">Blur</label>
        <Slider value={shadowBlur} onChange={(v) => updateLayer(layer.id, { props: { ...layer.props, shadowBlur: v } })} min={0} max={50} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Offset X</label>
          <input type="number" value={shadowOffsetX} onChange={(e) => updateLayer(layer.id, { props: { ...layer.props, shadowOffsetX: Number(e.target.value) } })} className="input text-xs h-7" />
        </div>
        <div>
          <label className="label">Offset Y</label>
          <input type="number" value={shadowOffsetY} onChange={(e) => updateLayer(layer.id, { props: { ...layer.props, shadowOffsetY: Number(e.target.value) } })} className="input text-xs h-7" />
        </div>
      </div>
    </div>
  );
}

function EffectsSection({ layer }: { layer: Layer }) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  const isShape = ['rectangle', 'ellipse', 'line', 'polygon'].includes(layer.type);
  const cornerRadius = (layer.props.cornerRadius as number) || 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Blend Mode</label>
        <select value={layer.blendMode} onChange={(e) => updateLayer(layer.id, { blendMode: e.target.value as BlendMode })} className="input text-xs h-7">
          {BLEND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {isShape && (
        <div>
          <label className="label">Corner Radius</label>
          <Slider value={cornerRadius} onChange={(v) => updateLayer(layer.id, { props: { ...layer.props, cornerRadius: v } })} min={0} max={100} />
        </div>
      )}
    </div>
  );
}

function TextSection({ layer }: { layer: Layer }) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  const text = (layer.props.text as string) || '';
  const fontSize = (layer.props.fontSize as number) || 32;
  const fontFamily = (layer.props.fontFamily as string) || 'Inter';
  const fill = (layer.props.fill as string) || '#ffffff';

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Text</label>
        <textarea
          value={text}
          onChange={(e) => updateLayer(layer.id, { props: { ...layer.props, text: e.target.value } })}
          className="input text-xs h-16 resize-none"
        />
      </div>
      <div>
        <label className="label">Font</label>
        <Select
          label="Font"
          value={fontFamily}
          onChange={(e) => updateLayer(layer.id, { props: { ...layer.props, fontFamily: e.target.value } })}
          options={[
            { value: 'Inter', label: 'Inter' },
            { value: 'Arial', label: 'Arial' },
            { value: 'Helvetica', label: 'Helvetica' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Georgia', label: 'Georgia' },
            { value: 'Courier New', label: 'Courier New' },
            { value: 'JetBrains Mono', label: 'JetBrains Mono' },
          ]}
        />
      </div>
      <div>
        <label className="label">Size</label>
        <Slider value={fontSize} onChange={(v) => updateLayer(layer.id, { props: { ...layer.props, fontSize: v } })} min={8} max={200} />
      </div>
      <div>
        <label className="label">Color</label>
        <ColorPicker value={fill} onChange={(c) => updateLayer(layer.id, { props: { ...layer.props, fill: c } })} />
      </div>
    </div>
  );
}

function ImageSection({ layer }: { layer: Layer }) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  const scale = layer.transform.scaleX || 1;

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Scale</label>
        <Slider value={Math.round(scale * 100)} onChange={(v) => updateLayer(layer.id, { transform: { ...layer.transform, scaleX: v / 100, scaleY: v / 100 } })} min={10} max={300} />
      </div>
    </div>
  );
}

export function PropertiesPanel() {
  const selectedLayer = useDesignStore((s) => s.getSelectedLayer());

  if (!selectedLayer) {
    return (
      <div className="p-4">
        <p className="text-xs text-text-tertiary text-center">
          Select a layer to edit properties
        </p>
      </div>
    );
  }

  const isShape = ['rectangle', 'ellipse', 'line', 'polygon'].includes(selectedLayer.type);

  const tabs = [
    { id: 'position', label: 'Position', content: <PositionSection layer={selectedLayer} /> },
    { id: 'fill', label: 'Fill', content: <FillSection layer={selectedLayer} /> },
    ...(isShape ? [{ id: 'stroke', label: 'Stroke', content: <StrokeSection layer={selectedLayer} /> }] : []),
    { id: 'shadow', label: 'Shadow', content: <ShadowSection layer={selectedLayer} /> },
    { id: 'effects', label: 'Effects', content: <EffectsSection layer={selectedLayer} /> },
    ...(selectedLayer.type === 'text' ? [{ id: 'text', label: 'Text', content: <TextSection layer={selectedLayer} /> }] : []),
    ...(selectedLayer.type === 'image' ? [{ id: 'image', label: 'Image', content: <ImageSection layer={selectedLayer} /> }] : []),
  ];

  return (
    <div className="p-4">
      <Tabs tabs={tabs} />
    </div>
  );
}
