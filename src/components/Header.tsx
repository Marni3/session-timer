import React from 'react';
import { Sun, Moon, Volume2, VolumeX, Trash2, Clock, Settings } from 'lucide-react';
import { formatEtaTime } from '../lib/timeUtils';

interface HeaderProps {
  sessionEta: Date;
  incompleteCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenClearConfirm: () => void;
  onOpenSettings: () => void;
  hasTasks: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  sessionEta,
  incompleteCount,
  soundEnabled,
  onToggleSound,
  isDark,
  onToggleTheme,
  onOpenClearConfirm,
  onOpenSettings,
  hasTasks,
}) => {
  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-3 border-b border-[var(--color-border)]">
      {/* Brand & Concept */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center font-bold text-sm tracking-tighter">
          S
        </div>
        <span className="font-bold tracking-tight text-lg sm:text-xl text-[var(--color-text-primary)]">
          Sessio
        </span>
      </div>

      {/* Session ETA Badge */}
      {hasTasks && incompleteCount > 0 && (
        <div 
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] shadow-xs"
          title="Estimated completion time for all remaining tasks"
        >
          <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Session ends at <strong className="text-[var(--color-text-primary)]">{formatEtaTime(sessionEta)}</strong></span>
          <span className="text-[var(--color-text-muted)] opacity-60">({incompleteCount} left)</span>
        </div>
      )}

      {/* Utility Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute all chimes' : 'Enable chimes'}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          title={isDark ? 'Switch to Daylight mode' : 'Switch to Obsidian dark mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          title="Theme palette and preferences"
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Clear All Tasks */}
        {hasTasks && (
          <button
            onClick={onOpenClearConfirm}
            className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
            title="Clear all tasks for this session"
            aria-label="Clear all tasks"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
