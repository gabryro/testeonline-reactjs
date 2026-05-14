import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  uid: string | null;
  name: string | null;
  isAdmin: boolean;
  siteKey: string | null;
  isLoggedIn: boolean;
  setAuth: (token: string, uid: string, name: string, isAdmin: boolean, siteKey?: string) => void;
  logout: () => void;
  setName: (name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      uid: null,
      name: null,
      isAdmin: false,
      siteKey: null,
      isLoggedIn: false,
      setAuth: (token, uid, name, isAdmin, siteKey) =>
        set({ token, uid, name, isAdmin, siteKey, isLoggedIn: true }),
      logout: () =>
        set({ token: null, uid: null, name: null, isAdmin: false, siteKey: null, isLoggedIn: false }),
      setName: (name) => set({ name }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        uid: state.uid,
        name: state.name,
        isAdmin: state.isAdmin,
        siteKey: state.siteKey,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
