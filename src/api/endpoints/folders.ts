import { api } from '@/api/client';

export interface FolderSummary {
  id: string;
  name: string;
  itemCount: number;
  parentId: string | null;
}

export const foldersApi = {
  list: (parentId?: string) =>
    api.get<FolderSummary[]>('/folders', {
      params: parentId ? { parentId } : undefined,
    }),

  get: (id: string) =>
    api.get<FolderSummary>(`/folders/${id}`),

  create: (name: string, parentId?: string) =>
    api.post<FolderSummary>('/folders', { name, parentId }),

  rename: (id: string, name: string) =>
    api.put<FolderSummary>(`/folders/${id}`, { name }),

  delete: (id: string) =>
    api.delete<void>(`/folders/${id}`),
};
