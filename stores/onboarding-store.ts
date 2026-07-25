import { create } from "zustand";

interface OnboardingState {
  selectedGames: string[];

  toggleGame: (id: string) => void;

  clear: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  selectedGames: [],

  toggleGame: (id) =>
    set((state) => ({
      selectedGames: state.selectedGames.includes(id)
        ? state.selectedGames.filter((game) => game !== id)
        : [...state.selectedGames, id],
    })),

  clear: () =>
    set({
      selectedGames: [],
    }),
}));