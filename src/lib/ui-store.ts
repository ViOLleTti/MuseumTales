"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppLanguage } from "./i18n";

interface UiState {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      language: "zh",
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set({ language: get().language === "en" ? "zh" : "en" }),
    }),
    {
      name: "museum-ui-language",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
