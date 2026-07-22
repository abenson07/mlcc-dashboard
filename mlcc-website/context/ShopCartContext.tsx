"use client";

import * as React from "react";
import { findShopProduct } from "@marketing/data/shop-products";

export type ShopCartLine = {
  productSlug: string;
  variant: string;
  quantity: number;
};

type ShopCartContextValue = {
  lines: ShopCartLine[];
  addLine: (productSlug: string, variant: string, quantity: number) => void;
  updateQuantity: (productSlug: string, variant: string, quantity: number) => void;
  removeLine: (productSlug: string, variant: string) => void;
  clear: () => void;
  totalQuantity: number;
  totalCents: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const STORAGE_KEY = "mlcc-shop-cart";

const ShopCartContext = React.createContext<ShopCartContextValue | null>(null);

function readStoredLines(): ShopCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is ShopCartLine =>
        !!l &&
        typeof l === "object" &&
        typeof (l as ShopCartLine).productSlug === "string" &&
        typeof (l as ShopCartLine).variant === "string" &&
        typeof (l as ShopCartLine).quantity === "number"
    );
  } catch {
    return [];
  }
}

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<ShopCartLine[]>([]);
  const [hydrated, setHydrated] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  React.useEffect(() => {
    setLines(readStoredLines());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addLine = React.useCallback(
    (productSlug: string, variant: string, quantity: number) => {
      setLines((prev) => {
        const idx = prev.findIndex(
          (l) => l.productSlug === productSlug && l.variant === variant
        );
        if (idx === -1) {
          return [...prev, { productSlug, variant, quantity }];
        }
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      });
    },
    []
  );

  const updateQuantity = React.useCallback(
    (productSlug: string, variant: string, quantity: number) => {
      setLines((prev) => {
        if (quantity <= 0) {
          return prev.filter(
            (l) => !(l.productSlug === productSlug && l.variant === variant)
          );
        }
        return prev.map((l) =>
          l.productSlug === productSlug && l.variant === variant
            ? { ...l, quantity }
            : l
        );
      });
    },
    []
  );

  const removeLine = React.useCallback((productSlug: string, variant: string) => {
    setLines((prev) =>
      prev.filter((l) => !(l.productSlug === productSlug && l.variant === variant))
    );
  }, []);

  const clear = React.useCallback(() => setLines([]), []);
  const openCart = React.useCallback(() => setIsCartOpen(true), []);
  const closeCart = React.useCallback(() => setIsCartOpen(false), []);

  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
  const totalCents = lines.reduce((sum, l) => {
    const product = findShopProduct(l.productSlug);
    return sum + (product?.priceCents ?? 0) * l.quantity;
  }, 0);

  const value: ShopCartContextValue = {
    lines,
    addLine,
    updateQuantity,
    removeLine,
    clear,
    totalQuantity,
    totalCents,
    isCartOpen,
    openCart,
    closeCart,
  };

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>;
}

export function useShopCart(): ShopCartContextValue {
  const ctx = React.useContext(ShopCartContext);
  if (!ctx) throw new Error("useShopCart must be used within ShopCartProvider");
  return ctx;
}
