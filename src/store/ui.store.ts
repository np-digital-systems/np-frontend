"use client";

import { createContext, useContext } from "react";

export interface UIState {
  isMobileMenuOpen: boolean;
  isScrolled: boolean;
  activeSection: string;
}

export const initialUIState: UIState = {
  isMobileMenuOpen: false,
  isScrolled: false,
  activeSection: "hero",
};

export type UIAction =
  | { type: "TOGGLE_MOBILE_MENU" }
  | { type: "SET_SCROLLED"; payload: boolean }
  | { type: "SET_ACTIVE_SECTION"; payload: string }
  | { type: "CLOSE_MOBILE_MENU" };

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "TOGGLE_MOBILE_MENU":
      return { ...state, isMobileMenuOpen: !state.isMobileMenuOpen };
    case "CLOSE_MOBILE_MENU":
      return { ...state, isMobileMenuOpen: false };
    case "SET_SCROLLED":
      return { ...state, isScrolled: action.payload };
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };
    default:
      return state;
  }
}

export const UIContext = createContext<{
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
} | null>(null);

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
