import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { FeatureTab } from "../types/settings";

export type SettingsStore = {
  featureTab: FeatureTab;
  setFeatureTab: (tab: FeatureTab) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set) => ({
      featureTab: "nodes",
      setFeatureTab: (tab) =>
        set((state) => {
          state.featureTab = tab;
        }),
    })),
    {
      name: "mesh-link-js-settings",
    },
  ),
);
