import React, { createContext, useContext } from "react";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapController } from "@/hooks/useMapController";

interface MapFlowContextValue {
  flow: ReturnType<typeof useMapFlow>;
  map: ReturnType<typeof useMapController>;
}

const MapFlowContext = createContext<MapFlowContextValue | undefined>(
  undefined,
);

export const MapFlowProvider: React.FC<{
  value: MapFlowContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <MapFlowContext.Provider value={value}>{children}</MapFlowContext.Provider>
  );
};

export const useMapFlowContext = () => {
  const ctx = useContext(MapFlowContext);
  if (!ctx)
    throw new Error("useMapFlowContext must be used within MapFlowProvider");
  return ctx;
};
