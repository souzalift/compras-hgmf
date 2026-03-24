'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { fmtBRL, PALETTE, PALETTE_BORDER, CHART_GRID } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

ChartJS.defaults.color = '#64748b'
ChartJS.defaults.font.family = "'DM Sans', sans-serif"

// ── Shared tooltip formatter ──────────────────────────────────────────────────
const brlTooltip = {
  callbacks: { label: (ctx: { raw: unknown }) => fmtBRL(Number(ctx.raw)) },
}

// ── Bar chart por mês ─────────────────────────────────────────────────────────
export function ChartMes({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
            borderColor: labels.map((_, i) => PALETTE_BORDER[i % PALETTE_BORDER.length]),
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false }, tooltip: brlTooltip },
        scales: {
          x: { grid: { color: CHART_GRID } },
          y: {
            grid: { color: CHART_GRID },
            ticks: { callback: (v) => 'R$' + (Number(v) / 1000).toFixed(0) + 'K' },
          },
        },
      }}
    />
  )
}

// ── Doughnut por setor ────────────────────────────────────────────────────────
export function ChartSetor({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: PALETTE,
            borderColor: 'rgba(10,14,26,0.8)',
            borderWidth: 3,
            // @ts-expect-error — chart.js type
            hoverOffset: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 9, padding: 12, font: { size: 10 } },
          },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.label}: ${fmtBRL(Number(ctx.raw))}` },
          },
        },
      }}
    />
  )
}

// ── Horizontal bar — top itens ────────────────────────────────────────────────
export function ChartTopItems({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: 'rgba(0,212,255,0.12)',
            borderColor: '#00d4ff',
            borderWidth: 1,
            borderRadius: 4,
            // @ts-expect-error — chart.js type
            hoverBackgroundColor: 'rgba(0,212,255,0.3)',
          },
        ],
      }}
      options={{
        indexAxis: 'y' as const,
        responsive: true,
        plugins: { legend: { display: false }, tooltip: brlTooltip },
        scales: {
          x: {
            grid: { color: CHART_GRID },
            ticks: { callback: (v) => 'R$' + (Number(v) / 1000).toFixed(0) + 'K' },
          },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      }}
    />
  )
}

// ── Bar chart tipo RM ─────────────────────────────────────────────────────────
export function ChartTipoRM({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
            borderColor: labels.map((_, i) => PALETTE_BORDER[i % PALETTE_BORDER.length]),
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: CHART_GRID } },
        },
      }}
    />
  )
}
