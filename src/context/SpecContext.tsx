"use client";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CLASSES, type specialization, getSpecializationByKey } from "@data/class";

interface SpecContextType {
  spec: specialization;
  setSpec: (spec: specialization) => void;
}

const SpecContext = createContext<SpecContextType | undefined>(undefined);

export const SpecProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [specKey, setSpecKey] = useState<string>("monk_mistweaver");

  // biome-ignore lint/correctness/useExhaustiveDependencies: read the stored spec once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedSpec");
      if (stored && stored !== specKey) setSpecKey(stored);
    }
  }, []);

  const spec = getSpecializationByKey(specKey) || CLASSES.MONK.SPECS.MISTWEAVER;

  // stable so consumers can list it as an effect dependency
  const setSpec = useCallback((newSpec: specialization) => {
    setSpecKey(newSpec.key);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSpec", newSpec.key);
    }
  }, []);

  const value = useMemo(() => ({ spec, setSpec }), [spec, setSpec]);

  return (
    <SpecContext.Provider value={value}>
      {children}
    </SpecContext.Provider>
  );
};

export const useSpec = (): SpecContextType => {
  const context = useContext(SpecContext);
  if (!context) throw new Error("useSpec must be used within a SpecProvider");
  return context;
};
