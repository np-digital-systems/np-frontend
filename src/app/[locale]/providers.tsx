"use client";

import { useReducer } from "react";
import { UIContext, uiReducer, initialUIState } from "@/store/ui.store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  return (
    <UIContext.Provider value={{ state, dispatch }}>
      {children}
    </UIContext.Provider>
  );
}
