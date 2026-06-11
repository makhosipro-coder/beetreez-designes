export type LayerType = 'rectangle' | 'ellipse' | 'text' | 'image' | 'group' | 'line' | 'polygon';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  transform: Transform;
  opacity: number;
  visible: boolean;
  locked: boolean;
  parentId: string | null;
  children: string[];
  zIndex: number;
  blendMode: BlendMode;
  props: Record<string, unknown>;
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten';

export interface DesignDocument {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: Record<string, Layer>;
  rootIds: string[];
  thumbnail?: string;
  folderId?: string;
  teamId?: string;
  metadata: {
    createdAt: number;
    updatedAt: number;
    authorId: string;
  };
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  description: string;
  patches: RecordPatch[];
}

export interface RecordPatch {
  path: string[];
  value: unknown;
  previousValue: unknown;
}
