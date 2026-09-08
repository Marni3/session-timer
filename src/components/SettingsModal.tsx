import React, { useEffect } from 'react';
import { X, Check, Sun, Moon, Monitor, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { ThemePalette } from '../types';
import { ThemeMode } from '../hooks/useTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: ThemePalette;
  onSelectPalette: (palette: ThemePalette) => void;
  themeMode: ThemeMode;
  onChangeThemeMode: (mode: ThemeMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

interface PaletteOption {
  id: ThemePalette;
  name: string;
  tagline: string;
  lightSwatches: { canvas: string; surface: string; accent: string };
  darkSwatches: { canvas: string; surface: string; accent: string };
}

const PALETTE_OPTIONS: PaletteOption[] = [
  {
    id: 'classic',
    name: 'Classic Emerald',
    tagline: 'Lively emerald on crisp canvas & obsidian',
    lightSwatches: { canvas: '#FBFBFA', surface: '#FFFFFF', accent: '#10B981' },
    darkSwatches: { canvas: '#121211', surface: '#1C1C1A', accent: '#34D399' },
  },
  {
    id: 'warm',
    name: 'Warm Paper & Sage',
    tagline: 'Soft linen & warm charcoal with calm sage',
    lightSwatches: { canvas: '#F6F5F1', surface: '#FFFFFF', accent: '#4D6D5E' },
    darkSwatches: { canvas: '#191816', surface: '#23211E', accent: '#7E9F8E' },
  },
  {
    id: 'nordic',
    name: 'Nordic Slate',
    tagline: 'Cool mist & slate navy with sea glass',
    lightSwatches: { canvas: '#F3F4F6', surface: '#FFFFFF', accent: '#3C6D68' },
    darkSwatches: { canvas: '#16181D', surface: '#1F2228', accent: '#6DA59E' },
  },
  {
    id: 'monolith',
    name: 'Monolith & Willow',
    tagline: 'Matte paper & graphite with subtle willow',
    lightSwatches: { canvas: '#F8F8F6', surface: '#FFFFFF', accent: '#59665B' },
    darkSwatches: { canvas: '#171716', surface: '#212120', accent: '#8E9B90' },
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  palette,
  onSelectPalette,
  themeMode,
  onChangeThemeMode,
  soundEnabled,
  onToggleSound,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-6"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
              Settings & Theme
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Palette Selection */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Color Palette
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PALETTE_OPTIONS.map((opt) => {
              const isSelected = palette === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectPalette(opt.id)}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-surface)] shadow-xs ring-1 ring-[var(--color-accent)]/20'
                      : 'border-[var(--color-border)] bg-[var(--color-canvas)]/60 hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs sm:text-sm font-semibold ${
                      isSelected ? 'text-[var(--color-accent)] font-bold' : 'text-[var(--color-text-primary)]'
                    }`}>
                      {opt.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[var(--color-accent)] stroke-[2.5]" />}
                  </div>

                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 line-clamp-1 leading-snug">
                    {opt.tagline}
                  </p>

                  {/* Swatch Preview Bar */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    {/* Light preview swatch */}
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 bg-white" title="Light mode preview">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.lightSwatches.accent }} />
                      <span className="text-[9px] text-stone-600 font-medium">Light</span>
                    </div>
                    {/* Dark preview swatch */}
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-stone-800 bg-[#161616]" title="Dark mode preview">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.darkSwatches.accent }} />
                      <span className="text-[9px] text-stone-300 font-medium">Dark</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Appearance / Theme Mode */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Appearance
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light' as ThemeMode, label: 'Daylight', icon: Sun },
              { id: 'dark' as ThemeMode, label: 'Obsidian', icon: Moon },
              { id: 'system' as ThemeMode, label: 'System', icon: Monitor },
            ].map(({ id, label, icon: Icon }) => {
              const isCurrent = themeMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChangeThemeMode(id)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-bold'
                      : 'border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Sound Effects Toggle */}
        <div className="pt-1">
          <label
            onClick={onToggleSound}
            className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors select-none"
          >
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[var(--color-accent)]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[var(--color-text-muted)]" />
              )}
              <div>
                <span className="block text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
                  Audio Feedback & Tactile Clicks
                </span>
                <span className="block text-[11px] text-[var(--color-text-muted)]">
                  Synthetic focus nudges, completion gongs, and switch clicks
                </span>
              </div>
            </div>

            <div
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                soundEnabled ? 'bg-[var(--color-accent)]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </label>
        </div>

        {/* Done Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold bg-[var(--color-accent)] hover:opacity-90 text-white rounded-xl shadow-xs transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
