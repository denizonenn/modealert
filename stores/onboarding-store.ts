import { create } from "zustand";

interface OnboardingState {
  selectedGames: string[];

  step: number;

  nextStep: () => void;

  previousStep: () => void;

  toggleGame: (id: string) => void;

  clear: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  selectedGames: [],

  step: 1,

  nextStep: () =>
    set((state) => ({
      step: Math.min(state.step + 1, 4),
    })),

  previousStep: () =>
    set((state) => ({
      step: Math.max(state.step - 1, 1),
    })),

  toggleGame: (id) =>
    set((state) => ({
      selectedGames: state.selectedGames.includes(id)
        ? state.selectedGames.filter((g) => g !== id)
        : [...state.selectedGames, id],
    })),

  clear: () =>
    set({
      selectedGames: [],
      step: 1,
    }),
}));