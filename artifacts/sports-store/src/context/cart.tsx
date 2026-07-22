import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product } from "@workspace/api-client-react";

export interface Customization {
  badge?: string;
  playerName?: string;
  playerNumber?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  customization?: Customization;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, size?: string, customization?: Customization) => void;
  removeItem: (productId: number, size?: string, customization?: Customization) => void;
  updateQuantity: (productId: number, quantity: number, size?: string, customization?: Customization) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "peri-sport-cart";

function customizationKey(c?: Customization) {
  if (!c) return "";
  return `${c.badge ?? ""}|${c.playerName ?? ""}|${c.playerNumber ?? ""}`;
}

function itemKey(productId: number, size?: string, customization?: Customization) {
  return `${productId}__${size ?? ""}__${customizationKey(customization)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, size?: string, customization?: Customization) => {
    setItems((prev) => {
      const key = itemKey(product.id, size, customization);
      const existing = prev.find((i) => itemKey(i.product.id, i.size, i.customization) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i.product.id, i.size, i.customization) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, size, customization }];
    });
  }, []);

  const removeItem = useCallback((productId: number, size?: string, customization?: Customization) => {
    setItems((prev) => prev.filter((i) => itemKey(i.product.id, i.size, i.customization) !== itemKey(productId, size, customization)));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number, size?: string, customization?: Customization) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        itemKey(i.product.id, i.size, i.customization) === itemKey(productId, size, customization) ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
