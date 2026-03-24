'use client';

import clsx from 'clsx';

type Status = 'idle' | 'loading' | 'ok' | 'error';

interface StatusBadgeProps {
  status: Status;
  message: string;
}

function getDotColor(status: Status) {
  switch (status) {
    case 'ok':
      return '#10b981'; // emerald-500
    case 'error':
      return '#ef4444'; // red-500
    case 'loading':
      return 'var(--accent)';
    case 'idle':
    default:
      return 'var(--muted)';
  }
}

export default function StatusBadge({ status, message }: StatusBadgeProps) {
  return (
    <div
      className="
        inline-flex items-center gap-2
        rounded-xl border border-border
        bg-surface px-4 py-2 text-sm font-medium
        text-foreground shadow-sm
        transition
      "
    >
      <span
        className={clsx(
          'inline-block h-2.5 w-2.5 shrink-0 rounded-full',
          (status === 'ok' || status === 'loading') && 'animate-pulse',
        )}
        style={{ backgroundColor: getDotColor(status) }}
      />

      <span
        className={clsx(
          status === 'error' && 'text-red-600 dark:text-red-400',
          status === 'idle' && 'text-muted',
          (status === 'ok' || status === 'loading') && 'text-foreground',
        )}
      >
        {message}
      </span>
    </div>
  );
}
