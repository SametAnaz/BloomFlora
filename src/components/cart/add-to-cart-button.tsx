'use client';

import { useState, useRef, useEffect } from 'react';

import { useCart, type CartItemAttributeValue } from '@/lib/cart/cart-context';
import type { ItemAttribute } from '@/lib/supabase/types';

/* ── Render a single attribute input ── */
function AttributeInput({
  attr,
  value,
  onChange,
  compact,
}: {
  attr: ItemAttribute;
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const base = compact
    ? 'w-full rounded-lg border border-[#E8D5D0] bg-white px-3 py-2 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20'
    : 'w-full rounded-xl border border-[#E8D5D0] bg-white px-4 py-3 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-2 focus:ring-[#8B3A4A]/20';

  if (attr.type === 'dropdown') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="">Seçiniz{attr.required ? ' *' : ''}</option>
        {(attr.options || []).filter(Boolean).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (attr.type === 'number') {
    return (
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`${attr.name} giriniz${attr.required ? ' *' : ''}...`}
        className={base}
      />
    );
  }

  /* text (default) */
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`${attr.name} giriniz${attr.required ? ' *' : ''}...`}
      className={base}
    />
  );
}

/* ── Toggle attribute input ── */
function ToggleAttributeInput({
  attr,
  enabled,
  textValue,
  onToggle,
  onTextChange,
  compact,
}: {
  attr: ItemAttribute;
  enabled: boolean;
  textValue: string;
  onToggle: (on: boolean) => void;
  onTextChange: (v: string) => void;
  compact?: boolean;
}) {
  const hasPlaceholder = !!attr.placeholder;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        className={`flex items-center gap-2.5 transition-colors ${
          compact ? 'text-sm' : 'text-sm'
        }`}
      >
        {/* Toggle track */}
        <span
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
            enabled ? 'bg-[#8B3A4A]' : 'bg-[#E8D5D0]'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
          />
        </span>
        <span className={`font-medium ${ enabled ? 'text-[#4D1D2A]' : 'text-[#8B6F75]' }`}>
          {attr.name}{enabled ? '' : ''}
        </span>
      </button>

      {/* Text field shown when toggle is ON and placeholder is defined */}
      {enabled && hasPlaceholder && (
        <input
          type="text"
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={attr.placeholder}
          className={compact
            ? 'w-full rounded-lg border border-[#E8D5D0] bg-white px-3 py-2 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20'
            : 'w-full rounded-xl border border-[#E8D5D0] bg-white px-4 py-3 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-2 focus:ring-[#8B3A4A]/20'
          }
        />
      )}
    </div>
  );
}

/* ── Main component ── */

interface AddToCartButtonProps {
  item: {
    id: string;
    name: string;
    slug: string;
    categorySlug: string;
    imageUrl: string | null;
    price: number | null;
    productCode?: string | null;
    customAttributes?: ItemAttribute[];
  };
  variant?: 'primary' | 'icon';
  className?: string;
}

export function AddToCartButton({ item, variant = 'primary', className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [attrValues, setAttrValues] = useState<Record<string, string>>({});
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [showPopover, setShowPopover] = useState(false);
  const [validationError, setValidationError] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const attrs = item.customAttributes || [];
  const hasOptions = attrs.length > 0;

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
        setValidationError('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPopover]);

  const updateAttr = (id: string, val: string) => {
    setAttrValues((prev) => ({ ...prev, [id]: val }));
    setValidationError('');
  };

  const updateToggle = (id: string, on: boolean) => {
    setToggleStates((prev) => ({ ...prev, [id]: on }));
    if (!on) setAttrValues((prev) => ({ ...prev, [id]: '' }));
    setValidationError('');
  };

  const validate = (): boolean => {
    for (const attr of attrs) {
      if (attr.required && !attrValues[attr.id]?.trim()) {
        setValidationError(`"${attr.name}" alanı zorunludur`);
        return false;
      }
    }
    return true;
  };

  const buildCustomAttributes = (): CartItemAttributeValue[] => {
    return attrs
      .filter((a) => {
        if (a.type === 'toggle') return !!toggleStates[a.id];
        return attrValues[a.id]?.trim();
      })
      .map((a) => {
        if (a.type === 'toggle') {
          const txt = attrValues[a.id]?.trim();
          return { name: a.name, value: txt || 'Evet' };
        }
        return { name: a.name, value: attrValues[a.id].trim() };
      });
  };

  const doAdd = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!validate()) return;

    addItem({
      id: item.id,
      name: item.name,
      slug: item.slug,
      categorySlug: item.categorySlug,
      imageUrl: item.imageUrl,
      price: item.price,
      productCode: item.productCode ?? null,
      customAttributes: buildCustomAttributes(),
    });
    setAdded(true);
    setAttrValues({});
    setToggleStates({});
    setShowPopover(false);
    setValidationError('');
    setTimeout(() => setAdded(false), 1200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasOptions && variant === 'icon') {
      setShowPopover(true);
      return;
    }
    doAdd(e);
  };

  /* ── ICON VARIANT ── */
  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          title="Sepete Ekle"
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#E8D5D0] bg-white text-[#8B3A4A] shadow-sm transition-all hover:bg-[#8B3A4A] hover:text-white hover:shadow-md ${
            added ? 'bg-[#25D366] border-[#25D366] text-white scale-110' : ''
          } ${className}`}
        >
          {added ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          )}
        </button>

        {/* Popover for options (icon variant) */}
        {showPopover && (
          <div
            ref={popoverRef}
            className="absolute bottom-full right-0 z-50 mb-2 w-72 rounded-xl border border-[#E8D5D0] bg-white p-4 shadow-xl space-y-3"
          >
            {attrs.map((attr) => (
              <div key={attr.id}>
                {attr.type === 'toggle' ? (
                  <ToggleAttributeInput
                    attr={attr}
                    enabled={!!toggleStates[attr.id]}
                    textValue={attrValues[attr.id] || ''}
                    onToggle={(on) => updateToggle(attr.id, on)}
                    onTextChange={(v) => updateAttr(attr.id, v)}
                    compact
                  />
                ) : (
                  <>
                    <label className="mb-1 block text-xs font-semibold text-[#4D1D2A]">
                      {attr.name}{attr.required ? ' *' : ''}
                    </label>
                    <AttributeInput
                      attr={attr}
                      value={attrValues[attr.id] || ''}
                      onChange={(v) => updateAttr(attr.id, v)}
                      compact
                    />
                  </>
                )}
              </div>
            ))}

            {validationError && (
              <p className="text-xs font-medium text-red-500">{validationError}</p>
            )}

            <button
              onClick={() => doAdd()}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#4D1D2A] px-4 py-2 text-sm font-semibold text-[#F5E6E8] transition-colors hover:bg-[#6B2D3D]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Sepete Ekle
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── PRIMARY VARIANT ── */
  return (
    <div className="space-y-3">
      {/* Custom attribute inputs */}
      {attrs.map((attr) => (
        <div key={attr.id}>
          {attr.type === 'toggle' ? (
            <ToggleAttributeInput
              attr={attr}
              enabled={!!toggleStates[attr.id]}
              textValue={attrValues[attr.id] || ''}
              onToggle={(on) => updateToggle(attr.id, on)}
              onTextChange={(v) => updateAttr(attr.id, v)}
            />
          ) : (
            <>
              <label className="mb-1.5 block text-sm font-medium text-[#4D1D2A]">
                {attr.name}{attr.required ? <span className="ml-1 text-red-400">*</span> : ''}
              </label>
              <AttributeInput
                attr={attr}
                value={attrValues[attr.id] || ''}
                onChange={(v) => updateAttr(attr.id, v)}
              />
            </>
          )}
        </div>
      ))}

      {/* Validation error */}
      {validationError && (
        <p className="text-sm font-medium text-red-500">{validationError}</p>
      )}

      {/* Button */}
      <button
        onClick={handleClick}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold transition-all ${
          added
            ? 'bg-[#25D366] text-white shadow-lg'
            : 'bg-[#4D1D2A] text-[#F5E6E8] shadow-lg hover:bg-[#6B2D3D] hover:shadow-xl'
        } ${className}`}
      >
        {added ? (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Sepete Eklendi!
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Sepete Ekle
          </>
        )}
      </button>
    </div>
  );
}
