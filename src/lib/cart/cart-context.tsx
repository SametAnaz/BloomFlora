'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

/* ─── Types ────────────────────────────────────────────────────────── */

export interface CartItemAttributeValue {
  name: string;
  value: string;
}

export interface CartItem {
  cartKey: string;     // unique key: id + attributes hash
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
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, qty: number) => void;
  updateGiftCardText: (cartKey: string, text: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'bloomflora-cart';

/* ─── Helpers ──────────────────────────────────────────────────────── */

/** Build a unique cart key from product id + sorted attribute values */
function buildCartKey(id: string, attrs: CartItemAttributeValue[] = []): string {
  if (attrs.length === 0) return id;
  const sorted = [...attrs].sort((a, b) => a.name.localeCompare(b.name));
  const suffix = sorted.map((a) => `${a.name}=${a.value}`).join('|');
  return `${id}::${suffix}`;
}

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
    const attrs = newItem.customAttributes || [];
    const key = buildCartKey(newItem.id, attrs);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === key);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...newItem, cartKey: key, quantity: 1, productCode: newItem.productCode ?? null, giftCardText: '', customAttributes: attrs }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity: qty } : i)));
  }, []);

  const updateGiftCardText = useCallback((cartKey: string, giftCardText: string) => {
    setItems((prev) => prev.map((i) => (i.cartKey === cartKey ? { ...i, giftCardText } : i)));
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
