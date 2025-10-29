import { create } from 'zustand';
import { Car } from '../types';
import { carAPI } from '../api/backend';

interface CarFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
}

interface CarState {
  cars: Car[];
  loading: boolean;
  error: string | null;
  filters: CarFilters;
  setFilters: (filters: CarFilters) => void;
  loadCars: () => Promise<void>;
  getCarById: (id: number) => Promise<Car | null>;
}

export const useCarStore = create<CarState>((set, get) => ({
  cars: [],
  loading: false,
  error: null,
  filters: {},

  setFilters: (filters: CarFilters) => {
    set({ filters });
    get().loadCars();
  },

  loadCars: async () => {
    set({ loading: true, error: null });
    try {
      const response = await carAPI.getAll(get().filters);
      set({ cars: response.cars, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  getCarById: async (id: number) => {
    try {
      const response = await carAPI.getById(id);
      return response.car;
    } catch (error) {
      console.error('Failed to get car:', error);
      return null;
    }
  },
}));
