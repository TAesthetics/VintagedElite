import { lookupProduct } from "@/lib/clothing";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = { slug: string; variantId: string; qty: number };

type CartState = {
  lines: CartLine[];
  add: (slug: string, variantId: string, qty?: number) => void;
  setQty: (slug: string, variantId: string, qty: number) => void;
  remove: (slug: string, variantId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (slug, variantId, qty = 1) => {
        const cap = lookupProduct(slug)?.unique || slug.startsWith("stueck-") ? 1 : 8;
        const lines = get().lines.map((line) => ({ ...line }));
        const index = lines.findIndex(
          (line) => line.slug === slug && line.variantId === variantId,
        );
        if (index >= 0) lines[index].qty = Math.min(cap, lines[index].qty + qty);
        else lines.push({ slug, variantId, qty: Math.min(cap, Math.max(1, qty)) });
        set({ lines });
      },
      setQty: (slug, variantId, qty) => {
        const cap = lookupProduct(slug)?.unique || slug.startsWith("stueck-") ? 1 : 8;
        const next = Math.max(0, Math.min(cap, qty));
        set({
          lines: get()
            .lines.map((line) =>
              line.slug === slug && line.variantId === variantId
                ? { ...line, qty: next }
                : line,
            )
            .filter((line) => line.qty > 0),
        });
      },
      remove: (slug, variantId) => {
        set({
          lines: get().lines.filter(
            (line) => !(line.slug === slug && line.variantId === variantId),
          ),
        });
      },
      clear: () => set({ lines: [] }),
    }),
    { name: "vdl-cart", merge: (persisted, current) => {
      const saved = (persisted as { lines?: CartLine[] } | undefined)?.lines ?? [];
      const map = new Map<string, CartLine>();
      for (const line of [...saved, ...current.lines]) {
        const key = `${line.slug}::${line.variantId}`;
        const cap = lookupProduct(line.slug)?.unique || line.slug.startsWith("stueck-") ? 1 : 8;
        const prev = map.get(key);
        map.set(key, prev ? { ...line, qty: Math.min(cap, prev.qty + line.qty) } : line);
      }
      return { ...current, lines: [...map.values()] };
    } },
  ),
);

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(useCart.persist.hasHydrated());
    return useCart.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}
