import { create } from 'zustand';

export interface ExploreFilterState {
  minPrice: number;
  maxPrice: number;
  category: string;
  skills: string[];
  languages: string[];
  searchTerm: string;
  
  // Actions
  setMinPrice: (price: number) => void;
  setMaxPrice: (price: number) => void;
  setPriceRange: (min: number, max: number) => void;
  setCategory: (category: string) => void;
  setSkills: (skills: string[]) => void;
  setLanguages: (languages: string[]) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
}

export const useExploreFilterStore = create<ExploreFilterState>((set) => ({
  minPrice: 0,
  maxPrice: 200,
  category: 'all',
  skills: [],
  languages: [],
  searchTerm: '',

  setMinPrice: (price) => set({ minPrice: price }),
  setMaxPrice: (price) => set({ maxPrice: price }),
  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),
  setCategory: (category) => set({ category }),
  setSkills: (skills) => set({ skills }),
  setLanguages: (languages) => set({ languages }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  clearFilters: () => set({
    minPrice: 0,
    maxPrice: 200,
    category: 'all',
    skills: [],
    languages: [],
    searchTerm: ''
  }),
}));