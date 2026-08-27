import React, { createContext, useContext, useEffect, useState } from "react";
import { createMesh } from "@blemeshjs/sdk-react-native";
import { MeshNetworkManager } from "@blemeshjs/sdk";

const MeshContext = createContext<MeshNetworkManager | null>(null);

export const MeshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mesh, setMesh] = useState<MeshNetworkManager | null>(null);

  useEffect(() => {
    let mounted = true;

    createMesh().then((instance) => {
      if (mounted) setMesh(instance);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!mesh) return null; // or splash screen

  return <MeshContext.Provider value={mesh}>{children}</MeshContext.Provider>;
};

export const useMesh = () => {
  const ctx = useContext(MeshContext);
  if (!ctx) throw new Error("Mesh not initialized");
  return ctx;
};

/**
 * The SDK builds nodes, elements and models out of mixins and proxies, so the
 * concrete shapes are not exported under stable names. Deriving them from the
 * manager keeps these aliases correct as the SDK changes.
 */
export type MeshNode = MeshNetworkManager["allNodes"][number];
export type MeshElement = MeshNode["elements"][number];
export type MeshModel = MeshElement["models"][number];
