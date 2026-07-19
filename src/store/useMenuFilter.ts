import { create } from 'zustand';

interface MenuFilterState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  vegOnly: boolean;
  setVegOnly: (v: boolean) => void;
}

export const useMenuFilter = create<MenuFilterState>((set) => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  vegOnly: false,
  setVegOnly: (v) => set({ vegOnly: v }),
}));
