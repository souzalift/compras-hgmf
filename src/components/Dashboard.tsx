'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import type { ProcessRow, ApiResponse } from '@/types';
import { fmtBRL } from '@/lib/utils';
import KpiCard from './KpiCard';
import SituacaoBars from './SituacaoBars';
import StatusBadge from './StatusBadge';
import ErrorPanel from './ErrorPanel';
import { ChartMes, ChartSetor, ChartTopItems, ChartTipoRM } from './Charts';

const REFRESH_MS = 5 * 60 * 1000;

type Status = 'idle' | 'loading' | 'ok' | 'error';

export default function Dashboard() {
  const [rows, setRows] = useState<ProcessRow[]>([]);
  const [sheets, setSheets] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [status, setStatus] = useState<Status>('loading');
  const [statusMsg, setStatusMsg] = useState('Carregando...');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('');
  const [nextAt, setNextAt] = useState<number>(0);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setStatus('loading');
    setStatusMsg('Buscando dados...');
    try {
      const res = await fetch('/api/planilha', { cache: 'no-store' });
      const data: ApiResponse & { error?: string } = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error ?? 'Erro desconhecido');

      setRows(data.rows);
      setSheets(data.sheets);
      setError(null);
      setStatus('ok');
      setStatusMsg('Conectado · OneDrive');
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      setNextAt(Date.now() + REFRESH_MS);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(msg);
      setStatus('error');
      setStatusMsg('Erro na leitura');
    }
  }, []);

  // ── Auto-refresh ─────────────────────────────────────────────────────────
  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  // ── Countdown ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      if (!nextAt) return;
      const diff = Math.max(0, nextAt - Date.now());
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${m}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, [nextAt]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => (filter === 'ALL' ? rows : rows.filter((r) => r.mes === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const total = filtered.reduce((s, r) => s + r.total, 0);
    const ag = filtered.filter((r) => r.sit.includes('AGUARDANDO')).length;
    const fin = filtered.filter((r) => r.sit === 'FINANCEIRO').length;
    return { total, ag, fin, count: filtered.length };
  }, [filtered]);

  const chartMes = useMemo(() => {
    const all = Array.from(new Set(rows.map((r) => r.mes))).sort();
    return {
      labels: all,
      values: all.map((m) =>
        rows.filter((r) => r.mes === m).reduce((s, r) => s + r.total, 0),
      ),
    };
  }, [rows]);

  const chartSetor = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      map[r.setor] = (map[r.setor] ?? 0) + r.total;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return { labels: sorted.map(([k]) => k), values: sorted.map(([, v]) => v) };
  }, [filtered]);

  const chartTop = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      if (r.item) map[r.item] = (map[r.item] ?? 0) + r.total;
    });
    const top = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    return {
      labels: top.map(([k]) => (k.length > 44 ? k.slice(0, 44) + '…' : k)),
      values: top.map(([, v]) => v),
    };
  }, [filtered]);

  const chartRM = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      if (r.rm) map[r.rm] = (map[r.rm] ?? 0) + 1;
    });
    return { labels: Object.keys(map), values: Object.values(map) };
  }, [filtered]);

  const sitMap = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      if (r.sit && r.sit !== 'UNDEFINED') map[r.sit] = (map[r.sit] ?? 0) + 1;
    });
    return map;
  }, [filtered]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative z-10 mx-auto max-w-[1400px] p-6">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
        <div>
          <h1
            className="font-display text-[1.85rem] font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(135deg,#fff 30%,#00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            COMPRAS 2026
          </h1>
          <p className="mt-1 text-[0.82rem] text-slate-500">
            Dashboard em tempo real · Microsoft Graph API
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={status} message={statusMsg} />
          <button
            onClick={load}
            disabled={status === 'loading'}
            className="rounded-lg border border-border bg-surface2 px-4 py-1.5 text-sm text-slate-300 transition hover:border-accent/60 hover:text-accent disabled:opacity-40"
          >
            {status === 'loading' ? '↻ Atualizando...' : '↻ Atualizar'}
          </button>
        </div>
      </header>

      {/* Error */}
      {error && <ErrorPanel message={error} />}

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['ALL', ...sheets].map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={clsx(
                'rounded-lg border px-4 py-1.5 font-display text-[0.74rem] font-bold uppercase tracking-wider transition',
                filter === m
                  ? 'border-accent bg-accent text-black'
                  : 'border-border bg-surface text-slate-500 hover:border-accent/60 hover:text-accent',
              )}
            >
              {m === 'ALL' ? 'Todos' : m}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-600">
          {lastUpdate && `Atualizado ${lastUpdate}`}
          {countdown && ` · próxima em ${countdown}`}
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon="💰"
          label="Total Empenhado"
          value={fmtBRL(kpis.total)}
          sub={`${kpis.count} processos`}
          accentColor="#00d4ff"
        />
        <KpiCard
          icon="📋"
          label="Processos"
          value={String(kpis.count)}
          sub={filter === 'ALL' ? sheets.join(' · ') || '—' : `${filter} 2026`}
          accentColor="#7c3aed"
        />
        <KpiCard
          icon="⏳"
          label="Aguardando Lib."
          value={String(kpis.ag)}
          sub="Pendentes de liberação"
          accentColor="#f59e0b"
        />
        <KpiCard
          icon="✅"
          label="No Financeiro"
          value={String(kpis.fin)}
          sub={
            kpis.count
              ? `${((kpis.fin / kpis.count) * 100).toFixed(1)}% do total`
              : '—'
          }
          accentColor="#10b981"
        />
      </div>

      {/* Charts row 1 */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-4 font-display text-[0.72rem] font-bold uppercase tracking-widest text-slate-500">
            <span className="text-accent">◈</span> Valor Total por Mês (R$)
          </p>
          {chartMes.labels.length > 0 && (
            <ChartMes labels={chartMes.labels} values={chartMes.values} />
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-4 font-display text-[0.72rem] font-bold uppercase tracking-widest text-slate-500">
            <span className="text-accent">◈</span> Distribuição por Setor
          </p>
          {chartSetor.labels.length > 0 && (
            <ChartSetor labels={chartSetor.labels} values={chartSetor.values} />
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-4 font-display text-[0.72rem] font-bold uppercase tracking-widest text-slate-500">
            <span className="text-accent">◈</span> Top 8 Itens por Valor
          </p>
          {chartTop.labels.length > 0 && (
            <ChartTopItems labels={chartTop.labels} values={chartTop.values} />
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-4 font-display text-[0.72rem] font-bold uppercase tracking-widest text-slate-500">
            <span className="text-accent">◈</span> Situação dos Processos
          </p>
          <SituacaoBars data={sitMap} />
        </div>
      </div>

      {/* Charts row 3 */}
      <div className="mb-4 rounded-2xl border border-border bg-surface p-5">
        <p className="mb-4 font-display text-[0.72rem] font-bold uppercase tracking-widest text-slate-500">
          <span className="text-accent">◈</span> Tipo de RM
        </p>
        {chartRM.labels.length > 0 && (
          <ChartTipoRM labels={chartRM.labels} values={chartRM.values} />
        )}
      </div>

      <footer className="border-t border-border pt-4 text-center text-[0.68rem] text-slate-600">
        Compras 2026 · Microsoft Graph API · Next.js + Vercel
      </footer>
    </div>
  );
}
