import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Battery } from "@/data/batteries";

export type CartItem = { battery: Battery; quantity: number };

type CartContextValue = {
  items: CartItem[];
  add: (battery: Battery) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bateria-ja-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.quantity * i.battery.price, 0);
    return {
      items,
      isOpen,
      setOpen,
      count,
      subtotal,
      add: (battery) =>
        setItems((prev) => {
          const existing = prev.find((p) => p.battery.id === battery.id);
          if (existing) {
            return prev.map((p) =>
              p.battery.id === battery.id ? { ...p, quantity: p.quantity + 1 } : p,
            );
          }
          return [...prev, { battery, quantity: 1 }];
        }),
      remove: (id) => setItems((prev) => prev.filter((p) => p.battery.id !== id)),
      setQuantity: (id, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((p) => p.battery.id !== id)
            : prev.map((p) => (p.battery.id === id ? { ...p, quantity: qty } : p)),
        ),
      clear: () => setItems([]),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
