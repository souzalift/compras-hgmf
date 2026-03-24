'use client';

import { capitalize, SIT_COLORS } from '@/lib/utils';

interface SituacaoBarsProps {
  data: Record<string, number>;
}

export default function SituacaoBars({ data }: SituacaoBarsProps) {
  const entries = Object.entries(data)
    .filter(([k]) => k && k !== 'UNDEFINED' && k !== 'NAN')
    .sort((a, b) => b[1] - a[1]);

  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface2 px-4 py-6 text-center text-sm text-muted">
        Nenhuma situação disponível para o filtro selecionado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([key, count]) => {
        const color = SIT_COLORS[key] ?? '#64748b';
        const pct = ((count / max) * 100).toFixed(1);

        return (
          <div
            key={key}
            className="grid grid-cols-[minmax(0,1fr)_120px_40px] items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)_48px]"
          >
            <span className="truncate text-[0.75rem] font-medium text-muted">
              {key.toUpperCase()}
            </span>

            <div className="h-2 overflow-hidden rounded-full bg-surface2">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>

            <span
              className="text-right font-display text-sm font-bold tabular-nums"
              style={{ color }}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
