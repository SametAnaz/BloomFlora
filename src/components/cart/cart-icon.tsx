'use client';

import { useCart } from '@/lib/cart/cart-context';

export function CartIcon() {
  const { totalCount, setIsCartOpen } = useCart();

  if (totalCount === 0) return null;

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="relative flex items-center justify-center rounded-md p-2 text-[#C4959E] transition-colors hover:text-[#F5E6E8]"
      title="Sepetim"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8B3A4A] text-[10px] font-bold text-white shadow">
        {totalCount > 99 ? '99+' : totalCount}
      </span>
    </button>
  );
}
