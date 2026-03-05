/**
 * DraggableTextBox — admin preview modunda metin öğelerini sürükle-bırak ile konumlandırır.
 *
 * Yaklaşım: `position: relative` + `transform: translate(px, px)`.
 * Referans eleman: en yakın <section> (hem sürükleme hem render için tutarlı).
 * position.x=50, position.y=50 → offset yok (varsayılan).
 * position.x=60 → sağa %10, position.y=40 → yukarı %10.
 */

'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { z } from 'zod';

// ─── Schema ──────────────────────────────────────────
export const textPositionSchema = z.object({
  x: z.number().min(0).max(100).default(50),
  y: z.number().min(0).max(100).default(50),
});
export type TextPosition = z.infer<typeof textPositionSchema>;

export const defaultTextPosition: TextPosition = { x: 50, y: 50 };

// ─── Helpers ─────────────────────────────────────────
/** Find the nearest <section> ancestor or fall back to parentElement */
function getRefElement(el: HTMLElement): HTMLElement {
  return (el.closest('section') as HTMLElement) ?? el.parentElement ?? el;
}

// ─── Component ───────────────────────────────────────
interface DraggableTextBoxProps {
  children: React.ReactNode;
  position?: TextPosition | null;
  onPositionChange?: (pos: TextPosition) => void;
  isPreview?: boolean;
  className?: string;
}

export function DraggableTextBox({
  children,
  position,
  onPositionChange,
  isPreview = false,
  className = '',
}: DraggableTextBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const didDragRef = useRef(false);
  const isDraggingRef = useRef(false); // ref to prevent React re-render from resetting inline styles

  // Reference element dimensions (section) for consistent drag ↔ render
  const refSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const posX = position?.x ?? 50;
  const posY = position?.y ?? 50;
  const offsetX = posX - 50;
  const offsetY = posY - 50;
  const hasOffset = offsetX !== 0 || offsetY !== 0;

  // ─────── Measure reference element (section) ──────
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ref = getRefElement(el);

    const measure = () => {
      refSizeRef.current = { w: ref.offsetWidth, h: ref.offsetHeight };
      // Update inline style if not currently dragging
      if (!isDraggingRef.current && el) {
        const ox = (posX - 50);
        const oy = (posY - 50);
        if (ox !== 0 || oy !== 0) {
          const px = (ox / 100) * refSizeRef.current.w;
          const py = (oy / 100) * refSizeRef.current.h;
          el.style.transform = `translate(${px}px, ${py}px)`;
        } else {
          el.style.transform = '';
        }
      }
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(ref);
    return () => ro.disconnect();
  }, [posX, posY]);

  // ─────── Pointer handlers ──────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isPreview || !onPositionChange) return;
      e.preventDefault();
      e.stopPropagation();

      const el = boxRef.current;
      if (!el) return;

      const ref = getRefElement(el);
      const refRect = ref.getBoundingClientRect();

      dragStart.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: posX,
        origY: posY,
      };
      isDraggingRef.current = true;
      setDragging(true);
      didDragRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        if (!dragStart.current) return;
        const dx = ev.clientX - dragStart.current.startX;
        const dy = ev.clientY - dragStart.current.startY;

        const newX = dragStart.current.origX + (dx / refRect.width) * 100;
        const newY = dragStart.current.origY + (dy / refRect.height) * 100;

        // Pixel offset using same reference dimensions as render
        const newPxX = ((newX - 50) / 100) * refRect.width;
        const newPxY = ((newY - 50) / 100) * refRect.height;
        if (el) {
          el.style.transform = `translate(${newPxX}px, ${newPxY}px)`;
        }
      };

      const onUp = (ev: PointerEvent) => {
        if (!dragStart.current) return;
        const dx = ev.clientX - dragStart.current.startX;
        const dy = ev.clientY - dragStart.current.startY;

        const newX = Math.round(
          Math.min(100, Math.max(0, dragStart.current.origX + (dx / refRect.width) * 100))
        );
        const newY = Math.round(
          Math.min(100, Math.max(0, dragStart.current.origY + (dy / refRect.height) * 100))
        );

        onPositionChange({ x: newX, y: newY });
        dragStart.current = null;
        isDraggingRef.current = false;
        setDragging(false);

        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [isPreview, onPositionChange, posX, posY],
  );

  // ─────── Reset ─────────────────────────────────────
  const handleReset = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPositionChange?.({ x: 50, y: 50 });
    },
    [onPositionChange],
  );

  // Block native HTML5 drag from bubbling to parent <div draggable> in BlockCanvas
  const stopNativeDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Prevent click from bubbling up after a drag (would trigger block selection in BlockCanvas)
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (didDragRef.current) {
      e.stopPropagation();
      e.preventDefault();
      didDragRef.current = false;
    }
  }, []);

  // ─────── Plain render (no offset, not preview) ────
  if (!hasOffset && !isPreview) {
    return <div className={className}>{children}</div>;
  }

  // Transform is applied via useLayoutEffect + ResizeObserver (not via React style)
  // to keep drag ↔ render consistent and avoid React re-render conflicts during drag
  const style: React.CSSProperties = {
    position: 'relative',
  };

  return (
    <div
      ref={boxRef}
      className={`draggable-text-box group/dtb ${className} ${isPreview ? 'select-none' : ''}`}
      style={style}
      draggable={false}
      onDragStart={stopNativeDrag}
      onClickCapture={handleClickCapture}
    >
      {children}

      {/* Drag handle — only visible in admin preview */}
      {isPreview && onPositionChange && (
        <div
          className={`
            absolute -top-3 -left-3 z-20 flex items-center gap-0.5
            rounded border bg-background/90 shadow-sm backdrop-blur-sm
            opacity-0 group-hover/dtb:opacity-100 transition-opacity
            ${dragging ? '!opacity-100 ring-2 ring-primary' : ''}
          `}
        >
          <button
            type="button"
            draggable={false}
            onPointerDown={handlePointerDown}
            onDragStart={stopNativeDrag}
            className="flex h-6 w-6 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
            title="Sürükle"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="3" r="1.2" />
              <circle cx="11" cy="3" r="1.2" />
              <circle cx="5" cy="8" r="1.2" />
              <circle cx="11" cy="8" r="1.2" />
              <circle cx="5" cy="13" r="1.2" />
              <circle cx="11" cy="13" r="1.2" />
            </svg>
          </button>

          {hasOffset && (
            <button
              type="button"
              onClick={handleReset}
              className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
              title="Konumu sıfırla"
            >
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Visible outline when hovered in preview */}
      {isPreview && onPositionChange && (
        <div
          className={`
            pointer-events-none absolute inset-0 -m-1 rounded border border-dashed
            opacity-0 group-hover/dtb:opacity-100 transition-opacity
            ${dragging ? '!opacity-100 border-primary' : 'border-primary/40'}
          `}
        />
      )}
    </div>
  );
}
