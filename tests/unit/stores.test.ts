import { describe, it, expect, beforeEach } from 'vitest';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

describe('designStore', () => {
  beforeEach(() => {
    useDesignStore.setState({
      document: null,
      layerState: { layers: {}, rootIds: [], selectedIds: new Set() },
      commandStack: { stack: [], pointer: -1, maxSize: 200 } as unknown as any,
      isDirty: false,
    });
  });

  it('initDocument creates a blank document', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);

    const state = useDesignStore.getState();
    expect(state.document).not.toBeNull();
    expect(state.document!.width).toBe(1920);
    expect(state.document!.height).toBe(1080);
    expect(state.document!.name).toBe('Untitled Design');
    expect(state.document!.id).toBeDefined();
    expect(state.layerState).toBeDefined();
    expect(state.layerState.rootIds).toEqual([]);
  });

  it('addLayer adds a layer and marks dirty', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);

    const layer = {
      id: '1', type: 'rectangle' as const, name: 'Test',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      opacity: 1, visible: true, locked: false,
      parentId: null, children: [], zIndex: 0,
      blendMode: 'normal' as const, props: { fill: '#ff0000' },
    };
    store.addLayer(layer);

    const state = useDesignStore.getState();
    expect(state.layerState.layers['1']).toBeDefined();
    expect(state.layerState.rootIds).toContain('1');
    expect(state.isDirty).toBe(true);
  });

  it('removeLayer removes a layer', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);
    store.addLayer({
      id: '1', type: 'rectangle', name: 'Test',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      opacity: 1, visible: true, locked: false,
      parentId: null, children: [], zIndex: 0,
      blendMode: 'normal', props: { fill: '#ff0000' },
    });

    let state = useDesignStore.getState();
    expect(state.layerState.layers['1']).toBeDefined();

    state.removeLayer('1');
    state = useDesignStore.getState();
    expect(state.layerState.layers['1']).toBeUndefined();
  });

  it('updateLayer patches layer properties', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);
    store.addLayer({
      id: '1', type: 'rectangle', name: 'Original',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      opacity: 1, visible: true, locked: false,
      parentId: null, children: [], zIndex: 0,
      blendMode: 'normal', props: { fill: '#ff0000' },
    });

    store.updateLayer('1', { name: 'Updated', opacity: 0.5 });
    const state = useDesignStore.getState();
    expect(state.layerState.layers['1'].name).toBe('Updated');
    expect(state.layerState.layers['1'].opacity).toBe(0.5);
  });

  it('selectLayer toggles selection', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);
    store.addLayer({
      id: '1', type: 'rectangle', name: 'Test',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      opacity: 1, visible: true, locked: false,
      parentId: null, children: [], zIndex: 0,
      blendMode: 'normal', props: { fill: '#ff0000' },
    });

    store.selectLayer('1');
    let state = useDesignStore.getState();
    expect(state.layerState.selectedIds.has('1')).toBe(true);

    store.selectLayer(null);
    state = useDesignStore.getState();
    expect(state.layerState.selectedIds.size).toBe(0);
  });

  it('getSelectedLayer returns null when nothing selected', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);
    expect(store.getSelectedLayer()).toBeNull();
  });

  it('getSelectedLayer returns selected layer', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);
    store.addLayer({
      id: '1', type: 'rectangle', name: 'Test',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      opacity: 1, visible: true, locked: false,
      parentId: null, children: [], zIndex: 0,
      blendMode: 'normal', props: { fill: '#ff0000' },
    });
    store.selectLayer('1');
    const selected = useDesignStore.getState().getSelectedLayer();
    expect(selected).not.toBeNull();
    expect(selected!.id).toBe('1');
  });

  it('toggleLayerVisibility toggles visible flag', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);
    store.addLayer({
      id: '1', type: 'rectangle', name: 'Test',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      opacity: 1, visible: true, locked: false,
      parentId: null, children: [], zIndex: 0,
      blendMode: 'normal', props: { fill: '#ff0000' },
    });
    store.toggleLayerVisibility('1');
    expect(useDesignStore.getState().layerState.layers['1'].visible).toBe(false);
    store.toggleLayerVisibility('1');
    expect(useDesignStore.getState().layerState.layers['1'].visible).toBe(true);
  });

  it('toggleLayerLock toggles locked flag', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);
    store.addLayer({
      id: '1', type: 'rectangle', name: 'Test',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      opacity: 1, visible: true, locked: false,
      parentId: null, children: [], zIndex: 0,
      blendMode: 'normal', props: { fill: '#ff0000' },
    });
    store.toggleLayerLock('1');
    expect(useDesignStore.getState().layerState.layers['1'].locked).toBe(true);
  });

  it('undo/redo modifies layer state', () => {
    const store = useDesignStore.getState();
    store.initDocument(1920, 1080);
    store.addLayer({
      id: '1', type: 'rectangle', name: 'Test',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      opacity: 1, visible: true, locked: false,
      parentId: null, children: [], zIndex: 0,
      blendMode: 'normal', props: { fill: '#ff0000' },
    });

    useDesignStore.getState().undo();

    const afterUndo = useDesignStore.getState();
    expect(afterUndo.layerState.layers['1']).toBeUndefined();
    expect(afterUndo.isDirty).toBe(true);

    useDesignStore.getState().redo();
    const afterRedo = useDesignStore.getState();
    expect(afterRedo.layerState.layers['1']).toBeDefined();
  });

  it('loadDocument restores document state', () => {
    const doc = {
      id: 'test-id', name: 'Loaded Design', width: 800, height: 600,
      layers: {}, rootIds: [],
      metadata: { createdAt: 100, updatedAt: 100, authorId: 'user' },
    };
    const store = useDesignStore.getState();
    store.loadDocument(doc as any);

    const state = useDesignStore.getState();
    expect(state.document!.name).toBe('Loaded Design');
    expect(state.document!.width).toBe(800);
    expect(state.document!.height).toBe(600);
  });
});

describe('uiStore', () => {
  beforeEach(() => {
    if (typeof document === 'undefined') {
      const doc = { documentElement: { classList: { toggle: () => {} } } };
      (globalThis as any).document = doc;
      (globalThis as any).localStorage = { getItem: () => null, setItem: () => {} };
    }
    useUIStore.setState({
      activeTool: 'select',
      zoom: 100,
      showGrid: true,
      snapToGrid: false,
      leftPanelOpen: true,
      rightPanelOpen: true,
      theme: 'dark',
    });
  });

  it('setActiveTool changes tool', () => {
    useUIStore.getState().setActiveTool('rectangle');
    expect(useUIStore.getState().activeTool).toBe('rectangle');
  });

  it('setZoom changes zoom', () => {
    useUIStore.getState().setZoom(150);
    expect(useUIStore.getState().zoom).toBe(150);
  });

  it('toggleGrid toggles showGrid', () => {
    useUIStore.getState().toggleGrid();
    expect(useUIStore.getState().showGrid).toBe(false);
    useUIStore.getState().toggleGrid();
    expect(useUIStore.getState().showGrid).toBe(true);
  });

  it('toggleSnap toggles snapToGrid', () => {
    useUIStore.getState().toggleSnap();
    expect(useUIStore.getState().snapToGrid).toBe(true);
  });

  it('toggleLeftPanel toggles leftPanelOpen', () => {
    useUIStore.getState().toggleLeftPanel();
    expect(useUIStore.getState().leftPanelOpen).toBe(false);
  });

  it('toggleRightPanel toggles rightPanelOpen', () => {
    useUIStore.getState().toggleRightPanel();
    expect(useUIStore.getState().rightPanelOpen).toBe(false);
  });

  it('setTheme changes theme', () => {
    useUIStore.getState().setTheme('light');
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('toggleTheme switches between dark and light', () => {
    expect(useUIStore.getState().theme).toBe('dark');
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('light');
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('dark');
  });
});

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it('starts with null user', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setUser sets user data', () => {
    const user = { id: '1', name: 'Test', email: 'test@example.com' };
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('setUser(null) clears user', () => {
    useAuthStore.getState().setUser({ id: '1', name: 'T', email: 't@t.com' });
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
