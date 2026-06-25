"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isIntegratedShellPath } from "@/lib/search/isIntegratedShellPath";
import GlobalSearchCommand from "./GlobalSearchCommand";

type GlobalSearchContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

export function useGlobalSearchContext(): GlobalSearchContextValue {
  const ctx = useContext(GlobalSearchContext);
  if (!ctx) {
    throw new Error("useGlobalSearchContext must be used within GlobalSearchProvider");
  }
  return ctx;
}

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const integrated = isIntegratedShellPath(pathname);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  useEffect(() => {
    if (!integrated) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [integrated, toggle]);

  useEffect(() => {
    if (!integrated && isOpen) setIsOpen(false);
  }, [integrated, isOpen]);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
      {integrated ? <GlobalSearchCommand /> : null}
    </GlobalSearchContext.Provider>
  );
}
