'use client'

interface KpiCardProps {
  icon: string
  label: string
  value: string
  sub: string
  accentColor: string
}

export default function KpiCard({ icon, label, value, sub, accentColor }: KpiCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:border-accent/50"
      style={{ '--kc': accentColor } as React.CSSProperties}
    >
      {/* Top accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: accentColor }}
      />
      <span className="mb-2 block text-xl">{icon}</span>
      <p className="text-[0.68rem] uppercase tracking-widest text-slate-500">{label}</p>
      <p
        className="mt-1 font-display text-2xl font-extrabold tracking-tight"
        style={{ color: '#e2e8f0' }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  )
}
