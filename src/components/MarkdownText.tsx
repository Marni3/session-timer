import React from 'react';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

function parseInline(text: string): React.ReactNode[] {
  // Matches `code`, [label](url), **bold**, *italic*, ~~strikethrough~~
  const regex = /(`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline code
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="font-mono bg-[var(--color-surface)] px-1 py-0.5 rounded text-[11px] border border-[var(--color-border)] text-[var(--color-text-primary)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Markdown Link
    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="underline text-[var(--color-accent)] hover:opacity-80 font-medium break-all"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Bold
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-[var(--color-text-primary)]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Strikethrough
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      return (
        <del key={index} className="line-through opacity-70">
          {part.slice(2, -2)}
        </del>
      );
    }

    return part;
  });
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');

        if (isBullet) {
          const bulletText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-[10px] leading-[1.6] select-none text-[var(--color-text-muted)]">•</span>
              <span className="flex-1 min-w-0 leading-relaxed">{parseInline(bulletText)}</span>
            </div>
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        return (
          <div key={idx} className="leading-relaxed break-words">
            {parseInline(line)}
          </div>
        );
      })}
    </div>
  );
};
