import { create } from "zustand";

interface OnboardingState {
  selectedGames: string[];

  selectedEvents: string[];

  step: number;

  nextStep: () => void;

  previousStep: () => void;

  toggleGame: (id: string) => void;

  toggleEvent: (id: string) => void;

  clear: () => void;
}

const TOTAL_STEPS = 3;

export const useOnboardingStore = create<OnboardingState>((set) => ({
  selectedGames: [],

  selectedEvents: [],

  step: 1,

  nextStep: () =>
    set((state) => ({
      step: Math.min(state.step + 1, TOTAL_STEPS),
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

  toggleEvent: (id) =>
    set((state) => ({
      selectedEvents: state.selectedEvents.includes(id)
        ? state.selectedEvents.filter((e) => e !== id)
        : [...state.selectedEvents, id],
    })),

  clear: () =>
    set({
      selectedGames: [],
      selectedEvents: [],
      step: 1,
    }),
}));
