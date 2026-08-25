"use client";

import { useReducer } from "react";
import { ThemeProvider } from "next-themes";

import {
  UIContext,
  uiReducer,
  initialUIState,
} from "@/store/ui.store";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UIContext.Provider value={{ state, dispatch }}>
        {children}
      </UIContext.Provider>
    </ThemeProvider>
  );
}