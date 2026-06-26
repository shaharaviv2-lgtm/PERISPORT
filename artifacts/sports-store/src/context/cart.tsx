import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product } from "@workspace/api-client-react";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, size?: string) => void;
  removeItem: (productId: number, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "peri-sport-cart";

function itemKey(productId: number, size?: string) {
  return `${productId}__${size ?? ""}`;
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

  const addItem = useCallback((product: Product, size?: string) => {
    setItems((prev) => {
      const key = itemKey(product.id, size);
      const existing = prev.find((i) => itemKey(i.product.id, i.size) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i.product.id, i.size) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, size }];
    });
  }, []);

  const removeItem = useCallback((productId: number, size?: string) => {
    setItems((prev) => prev.filter((i) => itemKey(i.product.id, i.size) !== itemKey(productId, size)));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number, size?: string) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        itemKey(i.product.id, i.size) === itemKey(productId, size) ? { ...i, quantity } : i
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
