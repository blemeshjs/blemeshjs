"use client";

import { MeshNetworkManager, createBrowserMesh } from "@mesh-link-js/sdk-web";
import React, { createContext, useContext, useEffect, useState } from "react";

const MeshContext = createContext<MeshNetworkManager | null>(null);

export const MeshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mesh, setMesh] = useState<MeshNetworkManager | null>(null);

  useEffect(() => {
    let mounted = true;

    createBrowserMesh(MeshNetworkManager.instance).then((instance) => {
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
