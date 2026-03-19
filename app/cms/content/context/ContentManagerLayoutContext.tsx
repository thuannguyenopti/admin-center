"use client";

import { createContext, useContext, ReactNode } from "react";
import usePersistentState from "@/app/usePersistentState";

type ContentManagerLayoutContextType = {
  contentSubNavExpanded: boolean;
  setContentSubNavExpanded: (value: boolean | ((prev: boolean) => boolean)) => void;
  contentSubNavPinned: boolean;
  setContentSubNavPinned: (value: boolean | ((prev: boolean) => boolean)) => void;
};

const ContentManagerLayoutContext = createContext<ContentManagerLayoutContextType | undefined>(undefined);

export function ContentManagerLayoutProvider({ children }: { children: ReactNode }) {
  const [contentSubNavExpanded, setContentSubNavExpanded] = usePersistentState(
    "contentSubNavExpanded",
    true
  );
  const [contentSubNavPinned, setContentSubNavPinned] = usePersistentState(
    "contentSubNavPinned",
    false
  );

  return (
    <ContentManagerLayoutContext.Provider
      value={{
        contentSubNavExpanded,
        setContentSubNavExpanded,
        contentSubNavPinned,
        setContentSubNavPinned,
      }}
    >
      {children}
    </ContentManagerLayoutContext.Provider>
  );
}

export function useContentManagerLayout() {
  const context = useContext(ContentManagerLayoutContext);
  if (!context) {
    return {
      contentSubNavExpanded: true,
      setContentSubNavExpanded: () => {},
      contentSubNavPinned: false,
      setContentSubNavPinned: () => {},
    };
  }
  return context;
}
