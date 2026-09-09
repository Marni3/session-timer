import React, { useEffect } from 'react';
import { X, Check, Sun, Moon, Monitor, Volume2, VolumeX, Sparkles, CircleDot } from 'lucide-react';
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
  showTimerRing: boolean;
  onToggleTimerRing: () => void;
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
  showTimerRing,
  onToggleTimerRing,
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

        {/* Section 1: Appearance Mode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2.5">
            Appearance Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { mode: 'light', label: 'Daylight', icon: Sun },
                { mode: 'dark', label: 'Obsidian', icon: Moon },
                { mode: 'system', label: 'System', icon: Monitor },
              ] as const
            ).map(({ mode, label, icon: Icon }) => {
              const isSelected = themeMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeThemeMode(mode)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-accent)] shadow-xs'
                      : 'border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Color Palette Presets */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Color Palette
            </label>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              Dual-mode calibrated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PALETTE_OPTIONS.map((opt) => {
              const isSelected = palette === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectPalette(opt.id)}
                  className={`flex flex-col p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] bg-[var(--color-canvas)] shadow-xs'
                      : 'border-[var(--color-border)] bg-[var(--color-canvas)] hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                      {opt.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[var(--color-accent)] stroke-[3]" />
                    )}
                  </div>

                  <span className="text-[11px] text-[var(--color-text-muted)] leading-tight mb-2.5">
                    {opt.tagline}
                  </span>

                  {/* Live Mini Color Swatches */}
                  <div className="flex items-center gap-2 mt-auto">
                    {/* Light Preview Pill */}
                    <div
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-stone-200 text-[9px] font-medium"
                      style={{ backgroundColor: opt.lightSwatches.canvas, color: '#1c1917' }}
                      title="Light mode preview"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: opt.lightSwatches.accent }}
                      />
                      <span>Light</span>
                    </div>

                    {/* Dark Preview Pill */}
                    <div
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-stone-800 text-[9px] font-medium"
                      style={{ backgroundColor: opt.darkSwatches.canvas, color: '#f5f5f4' }}
                      title="Dark mode preview"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: opt.darkSwatches.accent }}
                      />
                      <span>Dark</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Timer & Audio Preferences */}
        <div className="space-y-2.5 pt-1">
          {/* Audio Feedback Toggle */}
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
                  Audio Feedback & Mechanical Clicks
                </span>
                <span className="block text-[11px] text-[var(--color-text-muted)]">
                  Tactile switch snap, bottom-out thock, and session gongs
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

          {/* Timer Display Mode (Circular Ring vs Text Only) */}
          <label
            onClick={onToggleTimerRing}
            className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors select-none"
          >
            <div className="flex items-center gap-2.5">
              <CircleDot className="w-4 h-4 text-[var(--color-accent)]" />
              <div>
                <span className="block text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
                  Circular Progress Ring
                </span>
                <span className="block text-[11px] text-[var(--color-text-muted)]">
                  {showTimerRing ? 'Display circular countdown ring' : 'Minimal text-only focus clock'}
                </span>
              </div>
            </div>

            <div
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                showTimerRing ? 'bg-[var(--color-accent)]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  showTimerRing ? 'translate-x-4' : 'translate-x-0'
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
