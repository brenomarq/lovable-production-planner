import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BomEdge, Item, ItemType, StockEntry } from "./types";
import { initialBom, initialItems, initialStock } from "./mock-data";
import { wouldCreateCycle } from "./bom-engine";

interface SigmeContextValue {
  items: Item[];
  bom: BomEdge[];
  stock: StockEntry[];

  addItem: (input: Omit<Item, "id">) => Item;
  updateItem: (id: string, patch: Partial<Omit<Item, "id">>) => void;
  removeItem: (id: string) => void;

  addBomEdge: (parentId: string, childId: string, quantity: number) =>
    | { ok: true }
    | { ok: false; error: string };
  updateBomEdge: (parentId: string, childId: string, quantity: number) => void;
  removeBomEdge: (parentId: string, childId: string) => void;

  setStock: (itemId: string, quantity: number) => void;

  itemById: (id: string) => Item | undefined;
}

const SigmeContext = createContext<SigmeContextValue | null>(null);

function uid(prefix = "itm"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SigmeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [bom, setBom] = useState<BomEdge[]>(initialBom);
  const [stock, setStockState] = useState<StockEntry[]>(initialStock);

  const addItem = useCallback((input: Omit<Item, "id">): Item => {
    const newItem: Item = { ...input, id: uid("itm") };
    setItems((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback(
    (id: string, patch: Partial<Omit<Item, "id">>) => {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setBom((prev) =>
      prev.filter((e) => e.parentId !== id && e.childId !== id),
    );
    setStockState((prev) => prev.filter((s) => s.itemId !== id));
  }, []);

  const addBomEdge = useCallback(
    (parentId: string, childId: string, quantity: number) => {
      if (quantity <= 0)
        return { ok: false as const, error: "A quantidade deve ser maior que zero." };
      if (parentId === childId)
        return { ok: false as const, error: "Um item não pode ser componente de si mesmo." };

      let result: { ok: true } | { ok: false; error: string } = { ok: true };
      setBom((prev) => {
        // Já existe? Soma quantidades (evita duplicar)
        const existing = prev.find(
          (e) => e.parentId === parentId && e.childId === childId,
        );
        if (existing) {
          return prev.map((e) =>
            e === existing ? { ...e, quantity: e.quantity + quantity } : e,
          );
        }
        if (wouldCreateCycle(prev, parentId, childId)) {
          result = {
            ok: false,
            error: "Esta relação criaria um ciclo na BOM.",
          };
          return prev;
        }
        return [...prev, { parentId, childId, quantity }];
      });
      return result;
    },
    [],
  );

  const updateBomEdge = useCallback(
    (parentId: string, childId: string, quantity: number) => {
      if (quantity <= 0) return;
      setBom((prev) =>
        prev.map((e) =>
          e.parentId === parentId && e.childId === childId
            ? { ...e, quantity }
            : e,
        ),
      );
    },
    [],
  );

  const removeBomEdge = useCallback((parentId: string, childId: string) => {
    setBom((prev) =>
      prev.filter((e) => !(e.parentId === parentId && e.childId === childId)),
    );
  }, []);

  const setStock = useCallback((itemId: string, quantity: number) => {
    const safe = Math.max(0, quantity);
    setStockState((prev) => {
      const existing = prev.find((s) => s.itemId === itemId);
      if (existing) {
        return prev.map((s) =>
          s.itemId === itemId ? { ...s, quantity: safe } : s,
        );
      }
      return [...prev, { itemId, quantity: safe }];
    });
  }, []);

  const itemById = useCallback(
    (id: string) => items.find((i) => i.id === id),
    [items],
  );

  const value = useMemo<SigmeContextValue>(
    () => ({
      items,
      bom,
      stock,
      addItem,
      updateItem,
      removeItem,
      addBomEdge,
      updateBomEdge,
      removeBomEdge,
      setStock,
      itemById,
    }),
    [
      items,
      bom,
      stock,
      addItem,
      updateItem,
      removeItem,
      addBomEdge,
      updateBomEdge,
      removeBomEdge,
      setStock,
      itemById,
    ],
  );

  return (
    <SigmeContext.Provider value={value}>{children}</SigmeContext.Provider>
  );
}

export function useSigme() {
  const ctx = useContext(SigmeContext);
  if (!ctx) throw new Error("useSigme must be used within SigmeProvider");
  return ctx;
}

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  PRODUCT: "Produto",
  SUBASSEMBLY: "Submontagem",
  COMPONENT: "Componente",
};
