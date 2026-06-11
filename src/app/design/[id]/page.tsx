'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { Toolbar } from '@/components/design/Toolbar';
import { LayerPanel } from '@/components/design/LayerPanel';
import { PropertiesPanel } from '@/components/design/PropertiesPanel';
import { ZoomControls } from '@/components/design/ZoomControls';
import { Header } from '@/components/layout/Header';
import { ContextMenu } from '@/components/design/ContextMenu';
import { ExportModal } from '@/components/design/ExportModal';
import { ErrorBoundary } from '@/components/design/ErrorBoundary';
import { toolRegistry } from '@/design-engine/tools/registry';
import type { ToolEvent, ToolContext } from '@/design-engine/tools/BaseTool';
import type { Layer, DesignDocument } from '@/design-engine/types';
import type { LayerTreeState } from '@/design-engine/layers';
import { v4 as uuid } from 'uuid';
import { storage } from '@/utils/browser/storage';
import { DraftRecoveryBanner } from '@/components/design/DraftRecoveryBanner';
import { AlignmentBar } from '@/components/design/AlignmentBar';
import type { SnapGuide } from '@/utils/design/alignment';

const DRAFT_KEY = 'design-draft';

export default function DesignPage({ params }: { params: { id: string } }) {
  const [zoom, setZoom] = useState(100);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const guidesRef = useRef<SnapGuide[]>([]);
  const { canvasRef, getEngine } = useCanvas(() => guidesRef.current);
  const activeTool = useUIStore((s) => s.activeTool);
  const setActiveTool = useUIStore((s) => s.setActiveTool);
  const layerState = useDesignStore((s) => s.layerState);
  const isDirty = useDesignStore((s) => s.isDirty);
  const canUndo = useDesignStore((s) => s.canUndo);
  const canRedo = useDesignStore((s) => s.canRedo);
  const leftPanelOpen = useUIStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const isPointerDown = useRef(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const getStore = useCallback(() => useDesignStore.getState(), []);

  const buildCtx = useCallback((): ToolContext => ({
    getLayerState: () => getStore().layerState,
    addLayer: (layer: Layer) => getStore().addLayer(layer),
    updateLayer: (id: string, patch: Partial<Layer>) => getStore().updateLayer(id, patch),
    removeLayer: (id: string) => getStore().removeLayer(id),
    selectLayer: (id: string | null) => getStore().selectLayer(id),
    getSelectedId: () => getStore().layerState.selectedIds.values().next().value ?? null,
    pushHistory: (desc: string) => getStore().pushHistory(desc),
  }), [getStore]);

  const syncGuides = useCallback(() => {
    const moveTool = toolRegistry.getTool('move');
    if ('getActiveGuides' in moveTool) {
      guidesRef.current = (moveTool as { getActiveGuides: () => SnapGuide[] }).getActiveGuides();
    } else {
      guidesRef.current = [];
    }
  }, []);

  useEffect(() => {
    const store = getStore();
    const id = params.id;
    const draft = storage.get<{ layerState: LayerTreeState; document: DesignDocument }>(DRAFT_KEY);

    if (draft && draft.document && draft.layerState && id === 'new') {
      store.loadDocument(draft.document);
      setShowDraftBanner(true);
    } else if (id !== 'new') {
      fetch(`/api/templates/${id}`).then((r) => {
        if (!r.ok) return fetch(`/api/designs/${id}`);
        return r;
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (!data) { store.initDocument(1920, 1080); return; }
          if (data.layers) {
            const layers: Record<string, Layer> = {};
            for (const l of data.layers) {
              layers[l.id] = l;
            }
            const doc: DesignDocument = {
              id: uuid(), name: data.name || 'Untitled',
              width: data.width || 1920, height: data.height || 1080,
              layers, rootIds: data.rootIds || Object.keys(layers),
              metadata: { createdAt: Date.now(), updatedAt: Date.now(), authorId: 'template' },
            };
            store.loadDocument(doc);
          } else {
            store.loadDocument(data);
          }
        });
    } else {
      store.initDocument(1920, 1080);
      const demoLayer: Layer = {
        id: uuid(),
        type: 'rectangle',
        name: 'Demo shape',
        transform: { x: 100, y: 80, width: 320, height: 200, rotation: 0, scaleX: 1, scaleY: 1 },
        opacity: 1, visible: true, locked: false, parentId: null, children: [],
        zIndex: 0, blendMode: 'normal', props: { fill: '#6c63ff' },
      };
      store.addLayer(demoLayer);
    }

    const handTool = toolRegistry.getTool('hand');
    if ('setPanCallback' in handTool) {
      (handTool as { setPanCallback: (cb: (dx: number, dy: number) => void) => void })
        .setPanCallback((dx: number, dy: number) => {
          getEngine()?.pan(dx, dy);
        });
    }

    const moveTool = toolRegistry.getTool('move');
    if ('setSnapEnabled' in moveTool) {
      (moveTool as { setSnapEnabled: (e: boolean) => void }).setSnapEnabled(true);
    }

    toolRegistry.activate('select', buildCtx());
  }, []);

  useEffect(() => {
    const unsub = useDesignStore.subscribe((state) => {
      if (!state.document) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        storage.set(DRAFT_KEY, {
          document: state.document,
          layerState: state.layerState,
        });
      }, 2000);
    });
    return () => { unsub(); if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (useDesignStore.getState().isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const getToolEvent = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): ToolEvent => {
      const engine = getEngine();
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const canvas = engine ? engine.screenToCanvas(sx, sy) : { x: sx, y: sy };
      return {
        canvasX: canvas.x,
        canvasY: canvas.y,
        screenX: sx,
        screenY: sy,
        originalEvent: e.nativeEvent,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
      };
    },
    [getEngine],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button === 2) return;
      isPointerDown.current = true;
      const event = getToolEvent(e);
      const tool = toolRegistry.getTool(activeTool);
      tool.onPointerDown?.(event, buildCtx());
    },
    [activeTool, getToolEvent, buildCtx],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isPointerDown.current) return;
      const event = getToolEvent(e);
      const tool = toolRegistry.getTool(activeTool);
      tool.onPointerMove?.(event, buildCtx());
      if (activeTool === 'move') syncGuides();
    },
    [activeTool, getToolEvent, buildCtx, syncGuides],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      isPointerDown.current = false;
      const event = getToolEvent(e);
      const tool = toolRegistry.getTool(activeTool);
      tool.onPointerUp?.(event, buildCtx());
    },
    [activeTool, getToolEvent, buildCtx],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const selectedId = layerState.selectedIds.values().next().value;

  const duplicateLayer = useCallback(() => {
    const store = getStore();
    const id = store.layerState.selectedIds.values().next().value;
    if (!id) return;
    const orig = store.layerState.layers[id];
    if (!orig) return;
    store.pushHistory('Duplicate layer');
    store.addLayer({
      ...orig,
      id: uuid(),
      name: orig.name + ' copy',
      transform: { ...orig.transform, x: orig.transform.x + 20, y: orig.transform.y + 20 },
      parentId: null,
    });
  }, [getStore]);

  const groupSelected = useCallback(() => {
    const store = getStore();
    const ids = [...store.layerState.selectedIds];
    if (ids.length < 2) return;
    const groupId = uuid();
    const first = store.layerState.layers[ids[0]];
    if (!first) return;
    store.pushHistory('Group layers');
    const group: Layer = {
      id: groupId, type: 'group', name: 'Group',
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      opacity: 1, visible: true, locked: false, parentId: null, children: ids,
      zIndex: first.zIndex, blendMode: 'normal', props: {},
    };
    for (const childId of ids) {
      const child = store.layerState.layers[childId];
      if (child) store.updateLayer(childId, { parentId: groupId });
    }
    store.addLayer(group);
    store.selectLayer(groupId);
  }, [getStore]);

  const bringForward = useCallback(() => {
    const store = getStore();
    const id = store.layerState.selectedIds.values().next().value;
    if (!id) return;
    const layer = store.layerState.layers[id];
    if (!layer) return;
    store.updateLayer(id, { zIndex: layer.zIndex + 1 });
  }, [getStore]);

  const sendBackward = useCallback(() => {
    const store = getStore();
    const id = store.layerState.selectedIds.values().next().value;
    if (!id) return;
    const layer = store.layerState.layers[id];
    if (!layer || layer.zIndex <= 0) return;
    store.updateLayer(id, { zIndex: layer.zIndex - 1 });
  }, [getStore]);

  useKeyboard({
    'v': () => handleToolChange('select'),
    'm': () => handleToolChange('move'),
    'h': () => handleToolChange('hand'),
    't': () => handleToolChange('text'),
    'r': () => handleToolChange('rectangle'),
    'o': () => handleToolChange('ellipse'),
    'i': () => handleToolChange('image'),
    'ctrl+z': () => getStore().undo(),
    'ctrl+shift+z': () => getStore().redo(),
    'delete': () => { const id = getStore().layerState.selectedIds.values().next().value; if (id) getStore().removeLayer(id); },
    'backspace': () => { const id = getStore().layerState.selectedIds.values().next().value; if (id) getStore().removeLayer(id); },
    'ctrl+d': () => duplicateLayer(),
    'arrowup': () => nudgeLayer(0, -1, false),
    'arrowdown': () => nudgeLayer(0, 1, false),
    'arrowleft': () => nudgeLayer(-1, 0, false),
    'arrowright': () => nudgeLayer(1, 0, false),
    'shift+arrowup': () => nudgeLayer(0, -10, true),
    'shift+arrowdown': () => nudgeLayer(0, 10, true),
    'shift+arrowleft': () => nudgeLayer(-10, 0, true),
    'shift+arrowright': () => nudgeLayer(10, 0, true),
    'ctrl+=': () => handleZoomChange(Math.min(zoom + 10, 500)),
    'ctrl+-': () => handleZoomChange(Math.max(zoom - 10, 10)),
    'ctrl+0': () => handleZoomChange(100),
    'ctrl+shift+l': () => { const s = getStore(); if (s.layerState.selectedIds.size >= 2) s.alignSelectedLayers('left'); },
    'ctrl+shift+r': () => { const s = getStore(); if (s.layerState.selectedIds.size >= 2) s.alignSelectedLayers('right'); },
    'ctrl+shift+t': () => { const s = getStore(); if (s.layerState.selectedIds.size >= 2) s.alignSelectedLayers('top'); },
    'ctrl+shift+b': () => { const s = getStore(); if (s.layerState.selectedIds.size >= 2) s.alignSelectedLayers('bottom'); },
    'ctrl+shift+c': () => { const s = getStore(); if (s.layerState.selectedIds.size >= 2) s.alignSelectedLayers('centerH'); },
    'ctrl+shift+m': () => { const s = getStore(); if (s.layerState.selectedIds.size >= 2) s.alignSelectedLayers('centerV'); },
    'ctrl+shift+h': () => { const s = getStore(); if (s.layerState.selectedIds.size >= 3) s.distributeSelectedLayers('horizontal'); },
    'ctrl+shift+v': () => { const s = getStore(); if (s.layerState.selectedIds.size >= 3) s.distributeSelectedLayers('vertical'); },
    ';': () => useUIStore.getState().toggleGuides(),
    '?': () => setShowShortcuts(true),
  });

  const handleToolChange = useCallback(
    (tool: string) => {
      setActiveTool(tool);
      toolRegistry.activate(tool, buildCtx());
    },
    [setActiveTool, buildCtx],
  );

  const handleSave = useCallback(async () => {
    const store = getStore();
    const doc = store.document;
    if (!doc) return;
    const body = JSON.stringify({ ...doc, layerState: store.layerState });
    const res = await fetch(`/api/designs/${doc.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body,
    });
    if (res.ok) {
      storage.set(DRAFT_KEY, { document: doc, layerState: store.layerState });
    }
  }, [getStore]);

  const handleExport = useCallback(async () => {
    setExportModalOpen(true);
  }, []);

  const handleExportFormat = useCallback(async (format: 'png' | 'jpeg' | 'svg') => {
    const { ExportEngine } = await import('@/design-engine/export');
    const engine = new ExportEngine();
    const state = getStore().layerState;
    const doc = getStore().document;
    if (!doc) return;
    if (format === 'svg') {
      const { downloadSvg } = await import('@/design-engine/export/SvgExport');
      downloadSvg(state, `${doc.name}.svg`, doc.width, doc.height);
    } else {
      engine.download(state, `${doc.name}.${format}`, { width: doc.width, height: doc.height, format });
    }
    setExportModalOpen(false);
  }, [getStore]);

  const handleDoubleClick = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = getEngine();
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const canvas = engine ? engine.screenToCanvas(sx, sy) : { x: sx, y: sy };
    const state = getStore().layerState;
    const layers = Object.values(state.layers);
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible || layer.locked || layer.type !== 'text') continue;
      const t = layer.transform;
      if (canvas.x >= t.x && canvas.x <= t.x + t.width && canvas.y >= t.y && canvas.y <= t.y + t.height) {
        const newText = prompt('Edit text:', (layer.props.text as string) || '');
        if (newText !== null) {
          getStore().pushHistory('Edit text');
          getStore().updateLayer(layer.id, { props: { ...layer.props, text: newText } });
        }
        return;
      }
    }
  }, [getEngine, getStore]);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
    getEngine()?.setViewport({ zoom: newZoom / 100 });
  }, [getEngine]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas-bg text-text-primary" onContextMenu={handleContextMenu}>
      <Header onExport={handleExport} onSave={handleSave} onToggleLeftPanel={toggleLeftPanel} onToggleRightPanel={toggleRightPanel} />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop left panel */}
        <div className="hidden w-[240px] flex-shrink-0 border-r border-border bg-canvas-surface lg:block">
          <ErrorBoundary>
          <Toolbar activeTool={activeTool} onToolChange={handleToolChange} />
          <div className="border-t border-border px-3 py-2">
            <div className="flex gap-2">
              <button
                data-testid="undo-btn"
                onClick={() => getStore().undo()}
                disabled={!canUndo}
                className={`flex h-8 flex-1 items-center justify-center rounded text-xs ${canUndo ? 'bg-canvas-grid text-text-secondary hover:bg-canvas-hover hover:text-text-primary' : 'bg-canvas-grid/50 text-text-secondary/40 cursor-not-allowed'}`}
              >
                Undo
              </button>
              <button
                data-testid="redo-btn"
                onClick={() => getStore().redo()}
                disabled={!canRedo}
                className={`flex h-8 flex-1 items-center justify-center rounded text-xs ${canRedo ? 'bg-canvas-grid text-text-secondary hover:bg-canvas-hover hover:text-text-primary' : 'bg-canvas-grid/50 text-text-secondary/40 cursor-not-allowed'}`}
              >
                Redo
              </button>
            </div>
          </div>
          </ErrorBoundary>
        </div>
        {/* Mobile left drawer */}
        {isMobile && leftPanelOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="flex-1 bg-black/50" onClick={toggleLeftPanel} />
            <div className="w-[240px] border-l border-border bg-canvas-surface shadow-xl">
              <Toolbar activeTool={activeTool} onToolChange={handleToolChange} />
              <div className="border-t border-border px-3 py-2">
                <div className="flex gap-2">
                  <button
                    data-testid="undo-btn"
                    onClick={() => getStore().undo()}
                    className="flex h-8 flex-1 items-center justify-center rounded bg-canvas-grid text-xs text-text-secondary hover:bg-canvas-hover hover:text-text-primary"
                  >
                    Undo
                  </button>
                  <button
                    data-testid="redo-btn"
                    onClick={() => getStore().redo()}
                    className="flex h-8 flex-1 items-center justify-center rounded bg-canvas-grid text-xs text-text-secondary hover:bg-canvas-hover hover:text-text-primary"
                  >
                    Redo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <AlignmentBar />
        <ErrorBoundary>
        <div className="relative min-w-0 flex-1 overflow-hidden bg-canvas-bg">
          <canvas
            ref={canvasRef as React.RefObject<HTMLCanvasElement>}
            className="h-full w-full touch-none"
            role="img"
            aria-label="Design canvas. Use the tools to add and edit elements."
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            style={{ cursor: toolRegistry.getCursor(activeTool) }}
          />
          <ZoomControls zoom={zoom} onZoomChange={handleZoomChange} />
        </div>
        </ErrorBoundary>
        {/* Desktop right panel */}
        <div className="hidden w-[280px] flex-shrink-0 border-l border-border bg-canvas-surface overflow-y-auto lg:block">
          <ErrorBoundary>
          <LayerPanel />
          <PropertiesPanel />
          </ErrorBoundary>
        </div>
        {/* Mobile right drawer */}
        {isMobile && rightPanelOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="w-[280px] border-r border-border bg-canvas-surface shadow-xl overflow-y-auto">
              <LayerPanel />
              <PropertiesPanel />
            </div>
            <div className="flex-1 bg-black/50" onClick={toggleRightPanel} />
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={[
            { label: 'Delete', shortcut: 'Del', action: () => { const id = getStore().layerState.selectedIds.values().next().value; if (id) getStore().removeLayer(id); }, disabled: !selectedId },
            { label: 'Duplicate', shortcut: 'Ctrl+D', action: () => duplicateLayer(), disabled: !selectedId },
            { label: '---', action: () => {} },
            { label: 'Group', shortcut: '', action: () => groupSelected(), disabled: getStore().layerState.selectedIds.size < 2 },
            { label: 'Bring Forward', action: () => bringForward(), disabled: !selectedId },
            { label: 'Send Backward', action: () => sendBackward(), disabled: !selectedId },
            { label: '---', action: () => {} },
            { label: 'Select All', shortcut: '', action: () => {
              const store = getStore();
              const ids = Object.keys(store.layerState.layers);
              for (const id of ids) store.selectLayer(id);
            }},
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}

      {showDraftBanner && (
        <DraftRecoveryBanner
          onRestore={() => {
            storage.remove(DRAFT_KEY);
            setShowDraftBanner(false);
          }}
          onDismiss={() => {
            storage.remove(DRAFT_KEY);
            setShowDraftBanner(false);
            getStore().initDocument(1920, 1080);
          }}
        />
      )}

        <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} onExport={handleExportFormat} />
        {showShortcuts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowShortcuts(false)}>
          <div className="w-[400px] rounded-lg bg-canvas-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Keyboard Shortcuts</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Select tool</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">V</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Move tool</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">M</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Hand tool</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">H</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Text tool</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">T</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Rectangle tool</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">R</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Ellipse tool</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">O</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Image tool</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">I</kbd></div>
              <hr className="border-border" />
              <div className="flex justify-between"><span className="text-text-secondary">Undo</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Z</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Redo</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Shift+Z</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Delete selected</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Del / ⌫</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Duplicate</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+D</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Zoom in</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+=</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Zoom out</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+-</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Reset zoom</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+0</kbd></div>
              <hr className="border-border" />
              <div className="flex justify-between"><span className="text-text-secondary">Nudge</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Arrow keys</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Nudge 10px</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Shift+Arrow</kbd></div>
              <hr className="border-border" />
              <div className="flex justify-between"><span className="text-text-secondary">Align left</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Shift+L</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Align right</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Shift+R</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Align top</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Shift+T</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Align bottom</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Shift+B</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Center H</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Shift+C</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Center V</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Shift+M</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Distribute H</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Shift+H</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Distribute V</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">Ctrl+Shift+V</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Toggle guides</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">;</kbd></div>
              <div className="flex justify-between"><span className="text-text-secondary">Shortcut help</span><kbd className="rounded bg-canvas-grid px-2 py-0.5 font-mono text-text-primary">?</kbd></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function nudgeLayer(dx: number, dy: number, _shifted: boolean) {
  const store = useDesignStore.getState();
  const id = store.layerState.selectedIds.values().next().value;
  if (!id) return;
  const layer = store.layerState.layers[id];
  if (!layer || layer.locked) return;
  store.pushHistory('Nudge layer');
  store.updateLayer(id, {
    transform: { ...layer.transform, x: layer.transform.x + dx, y: layer.transform.y + dy },
  });
}
