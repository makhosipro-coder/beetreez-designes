import { api } from '@/api/client';
import type { DesignDocument } from '@/design-engine/types';

export interface DesignSummary {
  id: string;
  name: string;
  thumbnail: string;
  updatedAt: number;
}

export const designsApi = {
  list: (folderId?: string) =>
    api.get<DesignSummary[]>('/designs', {
      params: folderId ? { folderId } : undefined,
    }),

  get: (id: string) =>
    api.get<DesignDocument>(`/designs/${id}`),

  create: (doc: Partial<DesignDocument>) =>
    api.post<DesignDocument>('/designs', doc),

  update: (id: string, doc: Partial<DesignDocument>) =>
    api.put<DesignDocument>(`/designs/${id}`, doc),

  delete: (id: string) =>
    api.delete<void>(`/designs/${id}`),

  duplicate: (id: string) =>
    api.post<DesignDocument>(`/designs/${id}/duplicate`),
};
