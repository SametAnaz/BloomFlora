'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

/* ─── Types ────────────────────────────────────────────────────────── */

export interface CartItemAttributeValue {
  name: string;
  value: string;
}

export interface CartItem {
  id: string;          // item id from DB
  name: string;
  slug: string;
  categorySlug: string;
  imageUrl: string | null;
  price: number | null;
  quantity: number;
  productCode: string | null;  // ürün kodu
  giftCardText: string; // hediye kartı metni
  customAttributes: CartItemAttributeValue[];  // özel özellik değerleri
}

interface AddItemPayload {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  imageUrl: string | null;
  price: number | null;
  productCode?: string | null;
  customAttributes?: CartItemAttributeValue[];  // pre-filled before adding
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (item: AddItemPayload) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateGiftCardText: (id: string, text: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'bloomflora-cart';

/* ─── Helpers ──────────────────────────────────────────────────────── */

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* quota exceeded — ignore */ }
}

/* ─── Provider ─────────────────────────────────────────────────────── */

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist whenever items change (after hydration)
  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((newItem: AddItemPayload) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...newItem, quantity: 1, productCode: newItem.productCode ?? null, giftCardText: '', customAttributes: newItem.customAttributes || [] }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  }, []);

  const updateGiftCardText = useCallback((id: string, giftCardText: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, giftCardText } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsCartOpen(false);
  }, []);

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        updateGiftCardText,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
