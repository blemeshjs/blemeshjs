import { DiscoveredUnprovisionedPeripheral } from "@mesh-link-js/sdk-web";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type ProvisioningStatus =
  | "idle"
  | "provisioning-scan"
  | "provisioning"
  | "provisioning-done"
  | "error";
export type ProvisioningStore = {
  isOpen: boolean;
  status: ProvisioningStatus;
  selectedDevice: DiscoveredUnprovisionedPeripheral | null;
  setIsOpen: (open: boolean) => void;
  setStatus: (status: ProvisioningStatus) => void;
  setSelectedDevice: (device: DiscoveredUnprovisionedPeripheral | null) => void;
  reset: () => void;
};

export const useProvisioningStore = create<ProvisioningStore>()(
  immer((set) => ({
    status: "idle",
    selectedDevice: null,
    isOpen: false,
    setIsOpen: (open) =>
      set((state) => {
        state.isOpen = open;
      }),
    reset: () =>
      set((state) => {
        state.status = "idle";
        state.selectedDevice = null;
      }),
    setStatus: (status) =>
      set((state) => {
        state.status = status;
      }),
    setSelectedDevice: (device) =>
      set((state) => {
        state.selectedDevice = device;
      }),
  })),
);
