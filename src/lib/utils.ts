export function fmtBRL(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(2)} M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)} K`
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

export function capitalize(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export const SIT_COLORS: Record<string, string> = {
  'FINANCEIRO': '#00d4ff',
  'AGUARDANDO LIBERAÇÃO': '#f59e0b',
  'ABRIR RM': '#ef4444',
  'ATENDIDA': '#10b981',
}

export const PALETTE = [
  'rgba(0,212,255,.7)',
  'rgba(124,58,237,.7)',
  'rgba(245,158,11,.7)',
  'rgba(16,185,129,.7)',
  'rgba(239,68,68,.7)',
]

export const PALETTE_BORDER = [
  '#00d4ff', '#7c3aed', '#f59e0b', '#10b981', '#ef4444',
]

export const CHART_GRID = 'rgba(31,45,69,0.6)'
