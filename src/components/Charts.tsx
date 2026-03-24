'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { fmtBRL, PALETTE, PALETTE_BORDER } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

ChartJS.defaults.font.family = "'DM Sans', sans-serif";

function getChartTheme() {
  if (typeof window === 'undefined') {
    return {
      text: '#64748b',
      grid: 'rgba(148, 163, 184, 0.18)',
      surfaceBorder: 'rgba(148, 163, 184, 0.22)',
      accentFill: 'rgba(37, 99, 235, 0.18)',
      accentBorder: '#2563eb',
      accentHover: 'rgba(37, 99, 235, 0.3)',
    };
  }

  const styles = getComputedStyle(document.documentElement);
  const isDark = document.documentElement.classList.contains('dark');

  const muted = styles.getPropertyValue('--muted').trim() || '#64748b';
  const accent = styles.getPropertyValue('--accent').trim() || '#2563eb';

  return {
    text: muted,
    grid: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.2)',
    surfaceBorder: isDark
      ? 'rgba(15, 23, 42, 0.9)'
      : 'rgba(255, 255, 255, 0.95)',
    accentFill: isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(37, 99, 235, 0.16)',
    accentBorder: accent,
    accentHover: isDark
      ? 'rgba(56, 189, 248, 0.32)'
      : 'rgba(37, 99, 235, 0.28)',
  };
}

const brlTooltip = {
  callbacks: {
    label: (ctx: { raw: unknown }) => fmtBRL(Number(ctx.raw)),
  },
};

export function ChartMes({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const theme = getChartTheme();

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
            borderColor: labels.map(
              (_, i) => PALETTE_BORDER[i % PALETTE_BORDER.length],
            ),
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: brlTooltip,
        },
        scales: {
          x: {
            ticks: { color: theme.text },
            grid: { color: theme.grid },
          },
          y: {
            ticks: {
              color: theme.text,
              callback: (v) => 'R$' + (Number(v) / 1000).toFixed(0) + 'K',
            },
            grid: { color: theme.grid },
          },
        },
      }}
    />
  );
}

export function ChartSetor({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const theme = getChartTheme();

  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: PALETTE,
            borderColor: theme.surfaceBorder,
            borderWidth: 3,
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
            labels: {
              color: theme.text,
              boxWidth: 9,
              padding: 12,
              font: { size: 10 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${fmtBRL(Number(ctx.raw))}`,
            },
          },
        },
      }}
    />
  );
}

export function ChartTopItems({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const theme = getChartTheme();

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: theme.accentFill,
            borderColor: theme.accentBorder,
            borderWidth: 1.5,
            borderRadius: 6,
            hoverBackgroundColor: theme.accentHover,
          },
        ],
      }}
      options={{
        indexAxis: 'y' as const,
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: brlTooltip,
        },
        scales: {
          x: {
            ticks: {
              color: theme.text,
              callback: (v) => 'R$' + (Number(v) / 1000).toFixed(0) + 'K',
            },
            grid: { color: theme.grid },
          },
          y: {
            ticks: {
              color: theme.text,
              font: { size: 10 },
            },
            grid: { display: false },
          },
        },
      }}
    />
  );
}

export function ChartTipoRM({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const theme = getChartTheme();

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
            borderColor: labels.map(
              (_, i) => PALETTE_BORDER[i % PALETTE_BORDER.length],
            ),
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: theme.text },
            grid: { display: false },
          },
          y: {
            ticks: { color: theme.text },
            grid: { color: theme.grid },
          },
        },
      }}
    />
  );
}
