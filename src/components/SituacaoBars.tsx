'use client'

import { capitalize, SIT_COLORS } from '@/lib/utils'

interface SituacaoBarsProps {
  data: Record<string, number>
}

export default function SituacaoBars({ data }: SituacaoBarsProps) {
  const entries = Object.entries(data)
    .filter(([k]) => k && k !== 'UNDEFINED' && k !== 'NAN')
    .sort((a, b) => b[1] - a[1])

  const max = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([key, count]) => {
        const color = SIT_COLORS[key] ?? '#64748b'
        const pct = ((count / max) * 100).toFixed(1)
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-[0.75rem] text-slate-500">
              {capitalize(key)}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <span
              className="w-7 text-right font-display text-sm font-bold"
              style={{ color }}
            >
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}
