/**
 * Color Picker Component
 * A simple color picker with preset colors and custom input
 */

'use client';

import { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
}

const defaultPresets = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#18181b', '#71717a', '#fafafa',
];

export function ColorPicker({
  value,
  onChange,
  label,
  presets = defaultPresets,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input value with prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
    setInputValue(color);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label ? (
        <label className="mb-1 block text-sm font-medium">{label}</label>
      ) : null}

      <div className="flex items-center gap-2">
        {/* Color Preview & Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-input transition-colors hover:border-primary"
          style={{ backgroundColor: value }}
          aria-label="Renk seç"
        />

        {/* Hex Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="h-10 w-24 rounded-md border border-input bg-background px-3 text-sm font-mono uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="#000000"
        />

        {/* Native Color Input */}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded border border-input bg-background p-1"
        />
      </div>

      {/* Presets Dropdown */}
      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-3 shadow-lg">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Hazır Renkler
          </p>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handlePresetClick(color)}
                className={`h-8 w-8 rounded-md border-2 transition-transform hover:scale-110 ${
                  value === color ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Renk seç: ${color}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
