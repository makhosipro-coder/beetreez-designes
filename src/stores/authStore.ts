import { create } from 'zustand';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AuthStore {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
