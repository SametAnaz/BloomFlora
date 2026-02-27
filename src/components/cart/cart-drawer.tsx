'use client';

import { useState } from 'react';

import Image from 'next/image';

import { useCart } from '@/lib/cart/cart-context';

/* ── Gift Card toggle + textarea per item ── */
function GiftCardField({ giftCardText, onChange }: { giftCardText: string; onChange: (t: string) => void }) {
  const [open, setOpen] = useState(giftCardText.length > 0);

  const toggle = () => {
    if (open) {
      onChange('');       // clear when toggling off
    }
    setOpen(!open);
  };

  return (
    <div className="mt-2">
      <button
        onClick={toggle}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          open
            ? 'bg-pink-50 text-pink-700 border border-pink-200'
            : 'text-[#8B6F75] hover:text-[#4D1D2A] border border-[#E8D5D0] hover:border-[#8B3A4A]'
        }`}
      >
        <span className="text-sm">🎁</span>
        {open ? 'Hediye Kartı Eklendi' : 'Hediye Kartı Ekle'}
      </button>
      {open && (
        <textarea
          value={giftCardText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Hediye kartına yazılacak mesajınız..."
          rows={2}
          className="mt-2 w-full resize-none rounded-lg border border-pink-200 bg-pink-50/50 px-3 py-1.5 text-sm text-[#4D1D2A] placeholder:text-pink-300 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400/20"
        />
      )}
    </div>
  );
}

interface CartDrawerProps {
  whatsappNumber: string;
}

export function CartDrawer({ whatsappNumber }: CartDrawerProps) {
  const {
    items,
    totalCount,
    totalPrice,
    removeItem,
    updateQuantity,
    updateGiftCardText,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [orderNote, setOrderNote] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isCartOpen) return null;

  /* ── Build WhatsApp message (structured JSON for n8n parsing) ── */
  const handleCheckout = () => {
    if (!phone.trim()) {
      setCheckoutError('Telefon numarası gereklidir');
      return;
    }
    setCheckoutError('');

    const order = {
      type: 'BLOOMFLORA_ORDER',
      version: '1.1',
      timestamp: new Date().toISOString(),
      customer: {
        phone: phone.trim(),
        name: fullName.trim() || null,
        address: address.trim() || null,
      },
      items: items.map((item, idx) => ({
        index: idx + 1,
        id: item.id,
        productCode: item.productCode || null,
        name: item.name,
        slug: item.slug,
        quantity: item.quantity,
        unitPrice: item.price ?? 0,
        lineTotal: (item.price ?? 0) * item.quantity,
        currency: 'TRY',
        giftCardText: item.giftCardText || null,
        customAttributes: item.customAttributes.length > 0 ? item.customAttributes : null,
      })),
      orderNote: orderNote.trim() || null,
      summary: {
        totalItems: totalCount,
        totalPrice: totalPrice,
        currency: 'TRY',
      },
    };

    const msg = `[BLOOMFLORA_ORDER]\n${JSON.stringify(order, null, 2)}`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8D5D0] px-6 py-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#8B3A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <h2 className="text-lg font-bold text-[#4D1D2A]">Sepetim ({totalCount})</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="rounded-lg p-2 text-[#8B6F75] hover:bg-[#F5E6E8] hover:text-[#4D1D2A] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="h-16 w-16 text-[#D4919A] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <p className="mt-4 font-medium text-[#4D1D2A]">Sepetiniz boş</p>
              <p className="mt-1 text-sm text-[#8B6F75]">Ürünleri keşfedip sepetinize ekleyin</p>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.cartKey} className="rounded-xl border border-[#E8D5D0] bg-[#FDFAF8] p-4">
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F5E6E8]">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg className="h-6 w-6 text-[#D4919A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[#4D1D2A] leading-tight">{item.name}</p>
                        <button
                          onClick={() => removeItem(item.cartKey)}
                          className="shrink-0 rounded p-1 text-[#8B6F75] hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Kaldır"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      {item.price ? (
                        <p className="mt-0.5 text-sm font-bold text-[#8B3A4A]">{item.price.toLocaleString('tr-TR')} ₺</p>
                      ) : null}

                      {/* Quantity */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E8D5D0] bg-white text-[#8B6F75] hover:border-[#8B3A4A] hover:text-[#8B3A4A] disabled:opacity-30 transition-colors"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-[#4D1D2A]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E8D5D0] bg-white text-[#8B6F75] hover:border-[#8B3A4A] hover:text-[#8B3A4A] transition-colors"
                        >
                          +
                        </button>
                        {item.price ? (
                          <span className="ml-auto text-sm font-bold text-[#4D1D2A]">
                            {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Custom attributes (read-only badges) */}
                  {item.customAttributes && item.customAttributes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.customAttributes.map((attr, i) => (
                        <div key={i} className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5">
                          <span className="text-xs font-medium text-sky-600">{attr.name}:</span>
                          <span className="text-xs font-semibold text-sky-800">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gift Card */}
                  <GiftCardField
                    giftCardText={item.giftCardText}
                    onChange={(text) => updateGiftCardText(item.cartKey, text)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Order Note + Checkout Form — scrolls with items */}
          {items.length > 0 && (
            <div className="mt-5 space-y-4 pb-2">
              {/* Order Note */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-[#8B6F75]">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Sipariş Notu
                </label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Teslimat notu, özel istek vb..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-[#E8D5D0] bg-white px-3 py-1.5 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20"
                />
              </div>

              {/* Checkout form — visible after clicking WhatsApp button */}
              {showCheckout && (
                <div className="space-y-3 rounded-xl border border-[#E8D5D0] bg-[#FDFAF8] p-4">
                  <h3 className="text-sm font-semibold text-[#4D1D2A]">Sipariş Bilgileri</h3>

                  {/* Phone */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8B6F75]">Telefon Numarası</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setCheckoutError(''); }}
                      placeholder="05XX XXX XX XX"
                      className="w-full rounded-lg border border-[#E8D5D0] bg-white px-3 py-2.5 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8B6F75]">İsim Soyisim</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Adınız Soyadınız"
                      className="w-full rounded-lg border border-[#E8D5D0] bg-white px-3 py-2.5 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8B6F75]">Teslimat Adresi</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Teslimat adresi..."
                      rows={2}
                      className="w-full resize-none rounded-lg border border-[#E8D5D0] bg-white px-3 py-2.5 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20"
                    />
                  </div>

                  {checkoutError && (
                    <p className="text-xs font-medium text-red-500">{checkoutError}</p>
                  )}

                  {/* Warning */}
                  <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs leading-relaxed text-amber-800">
                      WhatsApp açıldığında mesaj otomatik oluşturulacaktır. Lütfen <strong>mesaj içeriğini değiştirmeden</strong> gönderin.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — compact: total + action buttons */}
        {items.length > 0 && (
          <div className="border-t border-[#E8D5D0] bg-[#FDFAF8] px-6 py-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#8B6F75]">Toplam</span>
              <span className="text-xl font-bold text-[#4D1D2A]">{totalPrice.toLocaleString('tr-TR')} ₺</span>
            </div>

            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#1da851] hover:shadow-xl"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp ile Sipariş Gönder
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 rounded-xl border border-[#E8D5D0] px-4 py-3 text-sm font-medium text-[#8B6F75] transition-colors hover:bg-[#F5E6E8] hover:text-[#4D1D2A]"
                >
                  Geri
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#1da851] hover:shadow-xl"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Gönder
                </button>
              </div>
            )}

            {/* Clear */}
            {showClearConfirm ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">Sepet temizlensin mi?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded-lg border border-[#E8D5D0] bg-white px-3 py-1.5 text-xs font-medium text-[#8B6F75] hover:bg-[#F5E6E8] transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => { clearCart(); setShowClearConfirm(false); }}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                  >
                    Evet, Temizle
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full rounded-lg py-2 text-sm font-medium text-[#8B6F75] hover:text-red-500 transition-colors"
              >
                Sepeti Temizle
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
