'use client';

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  sub: string;
  accentColor: string;
}

export default function KpiCard({
  icon,
  label,
  value,
  sub,
  accentColor,
}: KpiCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
      style={{ '--kc': accentColor } as React.CSSProperties}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-90"
        style={{ backgroundColor: accentColor }}
      />

      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl transition-opacity duration-200 group-hover:opacity-20"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10">
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface2 text-xl shadow-sm">
          {icon}
        </span>

        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
        </p>

        <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-[1.9rem]">
          {value}
        </p>

        <p className="mt-1 text-xs text-muted">{sub}</p>
      </div>
    </div>
  );
}
