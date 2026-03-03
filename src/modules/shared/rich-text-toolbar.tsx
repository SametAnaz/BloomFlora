/**
 * Rich Text Formatting Toolbar
 * Provides HTML formatting buttons for the richText block editor
 */

'use client';

import { useRef } from 'react';

interface RichTextFormatToolbarProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextFormatToolbar({ content, onChange }: RichTextFormatToolbarProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  /** Wrap currently selected text with an inline tag (e.g. <strong>, <em>) */
  const wrapInlineTag = (openTag: string, closeTag: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const newContent =
      content.substring(0, start) +
      openTag +
      (selected || 'metin') +
      closeTag +
      content.substring(end);
    onChange(newContent);
    // Restore caret after React re-render
    setTimeout(() => {
      el.focus();
      const innerStart = start + openTag.length;
      const innerEnd = innerStart + (selected || 'metin').length;
      el.setSelectionRange(innerStart, innerEnd);
    }, 0);
  };

  /** Wrap selected text (or a placeholder) in a block tag (h1-h4, p, etc.) */
  const wrapBlockTag = (tag: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end).trim();
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = `${before}<${tag}>\n  ${selected || 'metin'}\n</${tag}>${after}`;
    onChange(newContent);
    setTimeout(() => el.focus(), 0);
  };

  /** Insert an unordered / ordered list skeleton */
  const insertList = (tag: 'ul' | 'ol') => {
    const el = ref.current;
    if (!el) return;
    const pos = el.selectionEnd;
    const snippet = `\n<${tag}>\n  <li>Madde 1</li>\n  <li>Madde 2</li>\n</${tag}>\n`;
    const newContent = content.substring(0, pos) + snippet + content.substring(pos);
    onChange(newContent);
    setTimeout(() => el.focus(), 0);
  };

  const sep = <div className="h-5 w-px bg-border" />;

  const btnBase =
    'inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded px-1.5 text-xs border border-transparent hover:border-border hover:bg-accent transition-colors cursor-pointer';

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="mb-0 flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 bg-muted/60 p-1.5">
        {/* Inline formatting */}
        <button type="button" className={`${btnBase} font-bold`} title="Kalın (Bold)" onClick={() => wrapInlineTag('<strong>', '</strong>')}>B</button>
        <button type="button" className={`${btnBase} italic`} title="İtalik (Italic)" onClick={() => wrapInlineTag('<em>', '</em>')}>I</button>
        <button type="button" className={`${btnBase} underline`} title="Altı Çizili (Underline)" onClick={() => wrapInlineTag('<u>', '</u>')}>U</button>
        <button type="button" className={`${btnBase} line-through`} title="Üstü Çizili (Strikethrough)" onClick={() => wrapInlineTag('<s>', '</s>')}>S</button>
        <button type="button" className={btnBase} title="Renk (Color - HTML style ekler)" onClick={() => wrapInlineTag('<span style="color:#e63946">', '</span>')}>
          <span className="h-3 w-3 rounded-full bg-red-500 ring-1 ring-offset-1 ring-border" />
        </button>

        {sep}

        {/* Headings */}
        <button type="button" className={`${btnBase} font-bold`} title="Başlık 1" onClick={() => wrapBlockTag('h1')}>H1</button>
        <button type="button" className={`${btnBase} font-semibold`} title="Başlık 2" onClick={() => wrapBlockTag('h2')}>H2</button>
        <button type="button" className={`${btnBase} font-medium`} title="Başlık 3" onClick={() => wrapBlockTag('h3')}>H3</button>
        <button type="button" className={btnBase} title="Başlık 4" onClick={() => wrapBlockTag('h4')}>H4</button>
        <button type="button" className={btnBase} title="Paragraf" onClick={() => wrapBlockTag('p')}>P</button>

        {sep}

        {/* Lists */}
        <button type="button" className={btnBase} title="Madde İmli Liste (Unordered)" onClick={() => insertList('ul')}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="2" cy="4" r="1.2" /><rect x="5" y="3.2" width="10" height="1.6" rx="0.8" />
            <circle cx="2" cy="8" r="1.2" /><rect x="5" y="7.2" width="10" height="1.6" rx="0.8" />
            <circle cx="2" cy="12" r="1.2" /><rect x="5" y="11.2" width="10" height="1.6" rx="0.8" />
          </svg>
        </button>
        <button type="button" className={btnBase} title="Numaralı Liste (Ordered)" onClick={() => insertList('ol')}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <text x="0" y="5" fontSize="5">1.</text>
            <rect x="5" y="3.2" width="10" height="1.6" rx="0.8" />
            <text x="0" y="9" fontSize="5">2.</text>
            <rect x="5" y="7.2" width="10" height="1.6" rx="0.8" />
            <text x="0" y="13" fontSize="5">3.</text>
            <rect x="5" y="11.2" width="10" height="1.6" rx="0.8" />
          </svg>
        </button>

        {sep}

        {/* Blockquote & link */}
        <button type="button" className={btnBase} title="Alıntı (Blockquote)" onClick={() => wrapBlockTag('blockquote')}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h2a1 1 0 010 2H5v2a1 1 0 01-2 0V4zM9 4a1 1 0 011-1h2a1 1 0 010 2h-1v2a1 1 0 01-2 0V4z" />
          </svg>
        </button>
        <button type="button" className={btnBase} title="Bağlantı (Link)" onClick={() => wrapInlineTag('<a href="URL">', '</a>')}>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M6 8a3 3 0 014.243 0l1.414 1.414a3 3 0 01-4.243 4.243L6 12.243"/>
            <path strokeLinecap="round" d="M10 8a3 3 0 00-4.243 0L4.343 9.414a3 3 0 004.243 4.243L10 12.243"/>
          </svg>
        </button>
      </div>

      {/* ── Textarea ── */}
      <textarea
        ref={ref}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="h-48 w-full rounded-b-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="<p>İçeriğinizi buraya yazın veya yukarıdaki araçları kullanın...</p>"
        spellCheck={false}
      />
    </div>
  );
}
