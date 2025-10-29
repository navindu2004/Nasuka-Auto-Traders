import { create } from 'zustand';
import { UserInfo } from '../types';
import { getUserInfo } from '../api/backend';

interface UserState {
  user: UserInfo | null;
  isAdmin: boolean;
  loading: boolean;
  loadUser: () => Promise<void>;
  setAdmin: (isAdmin: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAdmin: false,
  loading: false,
  
  loadUser: async () => {
    set({ loading: true });
    try {
      const userData = await getUserInfo();
      set({ user: userData, loading: false });
    } catch (error) {
      console.error('Failed to load user:', error);
      set({ loading: false });
    }
  },

  setAdmin: (isAdmin: boolean) => set({ isAdmin }),
}));