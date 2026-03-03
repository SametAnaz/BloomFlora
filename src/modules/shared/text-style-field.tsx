/**
 * Shared Text Style Field
 * Provides typography controls (bold, italic, underline, strikethrough, color) for block editors
 */

'use client';

import { z } from 'zod';

// =====================================================
// Schema - use in module configSchemas
// =====================================================

export const textStyleFieldSchema = z.object({
  fontWeight: z.enum(['normal', 'medium', 'semibold', 'bold', 'extrabold']).optional(),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  color: z.string().optional(),
});

export type TextStyleFieldValue = z.infer<typeof textStyleFieldSchema>;

// =====================================================
// CSS Class Helpers
// =====================================================

export const fontWeightClasses: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

export const fontStyleClasses: Record<string, string> = {
  normal: 'not-italic',
  italic: 'italic',
};

export const textDecorationClasses: Record<string, string> = {
  none: 'no-underline',
  underline: 'underline',
  'line-through': 'line-through',
};

/** Build a combined Tailwind class string from a TextStyleFieldValue */
export function buildTextStyleClass(style?: TextStyleFieldValue | null): string {
  if (!style) return '';
  const parts: string[] = [];
  if (style.fontWeight) parts.push(fontWeightClasses[style.fontWeight] ?? '');
  if (style.fontStyle) parts.push(fontStyleClasses[style.fontStyle] ?? '');
  if (style.textDecoration) parts.push(textDecorationClasses[style.textDecoration] ?? '');
  return parts.filter(Boolean).join(' ');
}

// =====================================================
// UI Component
// =====================================================

interface TextStyleFieldProps {
  value: TextStyleFieldValue;
  onChange: (value: TextStyleFieldValue) => void;
  label?: string;
  /** Hide color picker - useful when the block already has a dedicated color option */
  hideColor?: boolean;
}

const FONT_WEIGHT_OPTIONS = [
  { value: 'normal',    label: 'N',  title: 'Normal',      style: { fontWeight: 400 } },
  { value: 'medium',    label: 'M',  title: 'Orta',        style: { fontWeight: 500 } },
  { value: 'semibold',  label: 'SB', title: 'Yarı Kalın',  style: { fontWeight: 600 } },
  { value: 'bold',      label: 'B',  title: 'Kalın',       style: { fontWeight: 700 } },
  { value: 'extrabold', label: 'EB', title: 'Çok Kalın',   style: { fontWeight: 800 } },
] as const;

export function TextStyleField({ value, onChange, label, hideColor = false }: TextStyleFieldProps) {
  const on  = 'bg-primary text-primary-foreground';
  const off = 'text-muted-foreground hover:text-foreground hover:bg-accent';
  const btn = 'inline-flex h-6 min-w-[1.375rem] items-center justify-center rounded text-[11px] transition-colors cursor-pointer select-none px-1';

  return (
    <div className="flex flex-wrap items-center gap-1">
      {label && <span className="mr-1 text-xs text-muted-foreground">{label}</span>}

      {/* Single unified toolbar */}
      <div className="flex items-center gap-px rounded border border-input bg-muted/40 p-px">
        {/* Font weight segment */}
        {FONT_WEIGHT_OPTIONS.map(({ value: w, label: lbl, title, style }) => {
          const isActive = (value.fontWeight ?? 'normal') === w;
          return (
            <button key={w} type="button" title={title}
              onClick={() => onChange({ ...value, fontWeight: w })}
              style={style}
              className={`${btn} ${isActive ? on : off}`}
            >
              {lbl}
            </button>
          );
        })}

        {/* Divider */}
        <span className="mx-0.5 h-4 w-px bg-border" />

        {/* Italic */}
        <button type="button" title="İtalik"
          onClick={() => onChange({ ...value, fontStyle: value.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`${btn} italic font-bold ${value.fontStyle === 'italic' ? on : off}`}
        >
          I
        </button>

        {/* Underline */}
        <button type="button" title="Altı Çizili"
          onClick={() => onChange({ ...value, textDecoration: value.textDecoration === 'underline' ? 'none' : 'underline' })}
          className={`${btn} underline ${value.textDecoration === 'underline' ? on : off}`}
        >
          U
        </button>

        {/* Strikethrough */}
        <button type="button" title="Üstü Çizili"
          onClick={() => onChange({ ...value, textDecoration: value.textDecoration === 'line-through' ? 'none' : 'line-through' })}
          className={`${btn} line-through ${value.textDecoration === 'line-through' ? on : off}`}
        >
          S
        </button>

        {/* Color */}
        {!hideColor && (
          <>
            <span className="mx-0.5 h-4 w-px bg-border" />
            <label className={`${btn} cursor-pointer relative`} title="Metin rengi">
              <span
                className="h-3 w-3 rounded-sm border border-border/50"
                style={{ backgroundColor: value.color ?? 'transparent', backgroundImage: !value.color ? 'linear-gradient(135deg, #999 25%, transparent 25%, transparent 75%, #999 75%)' : 'none', backgroundSize: '4px 4px' }}
              />
              <input
                type="color"
                value={value.color ?? '#000000'}
                onChange={(e) => onChange({ ...value, color: e.target.value })}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>
            {value.color && (
              <button type="button" title="Rengi temizle"
                onClick={() => onChange({ ...value, color: undefined })}
                className={`${btn} ${off}`}
              >
                ×
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

