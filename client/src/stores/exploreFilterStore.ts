import { create } from 'zustand';

export interface ExploreFilterState {
  minPrice: number;
  maxPrice: number;
  categories: string[];
  skills: string[];
  languages: string[];
  purposes: string[];
  searchTerm: string;
  
  // Actions
  setMinPrice: (price: number) => void;
  setMaxPrice: (price: number) => void;
  setPriceRange: (min: number, max: number) => void;
  setCategories: (categories: string[]) => void;
  setSkills: (skills: string[]) => void;
  setLanguages: (languages: string[]) => void;
  setPurposes: (purposes: string[]) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
}

// Available purposes for filtering
export const PURPOSES = ['Meet & Greet', 'Professionals', 'Discover'];

export const useExploreFilterStore = create<ExploreFilterState>((set) => ({
  minPrice: 0,
  maxPrice: 200,
  categories: [],
  skills: [],
  languages: [],
  purposes: [],
  searchTerm: '',

  setMinPrice: (price) => set({ minPrice: price }),
  setMaxPrice: (price) => set({ maxPrice: price }),
  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),
  setCategories: (categories) => set({ categories }),
  setSkills: (skills) => set({ skills }),
  setLanguages: (languages) => set({ languages }),
  setPurposes: (purposes) => set({ purposes }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  clearFilters: () => set({
    minPrice: 0,
    maxPrice: 200,
    categories: [],
    skills: [],
    languages: [],
    purposes: [],
    searchTerm: ''
  }),
}));