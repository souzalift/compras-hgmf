'use client'

import clsx from 'clsx'

type Status = 'idle' | 'loading' | 'ok' | 'error'

interface StatusBadgeProps {
  status: Status
  message: string
}

export default function StatusBadge({ status, message }: StatusBadgeProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs',
        status === 'ok' && 'border-emerald/50 text-emerald',
        status === 'error' && 'border-red-500/50 text-red-400',
        (status === 'idle' || status === 'loading') &&
          'border-border bg-surface text-slate-500'
      )}
    >
      <span
        className={clsx(
          'h-1.5 w-1.5 rounded-full shrink-0',
          status === 'ok' && 'bg-emerald animate-blink',
          status === 'error' && 'bg-red-500',
          status === 'loading' && 'bg-accent animate-blink',
          status === 'idle' && 'bg-slate-600'
        )}
      />
      {message}
    </div>
  )
}
