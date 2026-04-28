import { Group } from "@blemeshjs/core";
import { Element, Model, Node } from "@blemeshjs/sdk-web";
import { immer } from "zustand/middleware/immer";
import { create } from "zustand/react";

export type ControlStore = {
  expandedKeys: Set<string | number>;
  selectedNode?: Node;
  selectedElement?: Element;
  selectedModel?: Model;
  selectedGroup?: Group;
  setExpandedKeys: (keys: Set<string | number>) => void;
  setSelectedNode: (node: Node | undefined) => void;
  setSelectedGroup: (group: Group | undefined) => void;
  setSelectedElement: (element: Element | undefined) => void;
  setSelectedModel: (model: Model | undefined) => void;
  reset: () => void;
};

export const useControlStore = create<ControlStore>()(
  immer((set) => ({
    expandedKeys: new Set(["elements"]),
    setSelectedGroup: (group) =>
      set((state) => {
        state.selectedGroup = group;
      }),
    setExpandedKeys: (keys) =>
      set((state) => {
        state.expandedKeys = keys;
      }),
    setSelectedNode: (node) =>
      set((state) => {
        state.selectedNode = node;
        state.selectedElement = node?.elements[0];
        state.selectedModel = node?.elements[0]?.models[0];
      }),
    setSelectedElement: (element) =>
      set((state) => {
        state.selectedElement = element;
        state.selectedModel = element?.models[0];
      }),
    setSelectedModel: (model) =>
      set((state) => {
        state.selectedModel = model;
      }),
    reset: () =>
      set((state) => {
        state.expandedKeys = new Set(["elements"]);
        state.selectedNode = undefined;
        state.selectedElement = undefined;
        state.selectedModel = undefined;
      }),
  })),
);
