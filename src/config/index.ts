export const config = {
  app: {
    name: 'beetreez designes',
    version: '0.1.0',
  },

  design: {
    defaultWidth: 1920,
    defaultHeight: 1080,
    minLayerSize: 1,
    maxHistorySteps: 200,
    autoSaveIntervalMs: 30000,
    exportQuality: 0.92,
  },

  canvas: {
    gridSize: 20,
    minZoom: 0.1,
    maxZoom: 10,
    zoomStep: 0.1,
    backgroundColor: '#1a1a2e',
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    timeout: 10000,
    retryCount: 3,
  },

  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
  },

  features: {
    enableAIAssistant: false,
    enableCollaboration: false,
    enableBrandKit: true,
    enableAnimation: false,
  },
} as const;

export type Config = typeof config;
