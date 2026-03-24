'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import type { ProcessRow, ApiResponse } from '@/types';
import { fmtBRL } from '@/lib/utils';
import KpiCard from './KpiCard';
import SituacaoBars from './SituacaoBars';
import StatusBadge from './StatusBadge';
import ErrorPanel from './ErrorPanel';
import ThemeToggle from './ThemeToggle';
import { ChartMes, ChartSetor, ChartTopItems, ChartTipoRM } from './Charts';

const REFRESH_MS = 5 * 60 * 1000;

type Status = 'idle' | 'loading' | 'ok' | 'error';

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // remove pontuação
    .toLowerCase()
    .trim();
}

export default function Dashboard() {
  const [rows, setRows] = useState<ProcessRow[]>([]);
  const [sheets, setSheets] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [status, setStatus] = useState<Status>('loading');
  const [statusMsg, setStatusMsg] = useState('Carregando...');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('');
  const [nextAt, setNextAt] = useState<number>(0);

  const load = useCallback(async () => {
    setStatus('loading');
    setStatusMsg('Buscando dados...');

    try {
      const res = await fetch('/api/planilha', { cache: 'no-store' });
      const data: ApiResponse & { error?: string } = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Erro desconhecido');
      }

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

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

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

  const filtered = useMemo(() => {
    const base = filter === 'ALL' ? rows : rows.filter((r) => r.mes === filter);

    const q = normalizeText(searchQuery);
    if (!q) return base;

    return base.filter((r) => {
      const item = normalizeText(r.item || '');
      const codigoItem = normalizeText(String(r.codigoItem || ''));
      return item.includes(q) || codigoItem.includes(q);
    });
  }, [rows, filter, searchQuery]);

  const kpis = useMemo(() => {
    const ativos = filtered.filter((r) => r.sit !== 'CANCELADO');
    const financeiro = ativos.filter((r) => r.sit === 'FINANCEIRO');

    return {
      total: financeiro.reduce((s, r) => s + r.total, 0),
      ag: ativos.filter((r) => r.sit.includes('AGUARDANDO')).length,
      fin: financeiro.length,
      count: ativos.length, // 👈 agora ignora CANCELADO
    };
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

    return {
      labels: sorted.map(([k]) => k),
      values: sorted.map(([, v]) => v),
    };
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
      labels: top.map(([k]) => (k.length > 44 ? `${k.slice(0, 44)}…` : k)),
      values: top.map(([, v]) => v),
    };
  }, [filtered]);

  const chartRM = useMemo(() => {
    const map: Record<string, number> = {};

    filtered.forEach((r) => {
      if (r.rm) map[r.rm] = (map[r.rm] ?? 0) + 1;
    });

    return {
      labels: Object.keys(map),
      values: Object.values(map),
    };
  }, [filtered]);

  const sitMap = useMemo(() => {
    const map: Record<string, number> = {};

    filtered.forEach((r) => {
      if (r.sit && r.sit !== 'UNDEFINED') {
        map[r.sit] = (map[r.sit] ?? 0) + 1;
      }
    });

    return map;
  }, [filtered]);

  return (
    <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Dashboard operacional
          </div>

          <h1 className="font-display text-[1.9rem] font-extrabold tracking-tight text-foreground sm:text-[2.15rem]">
            Compras 2026
          </h1>

          <p className="mt-1 text-sm text-muted">
            Visão diária da planilha com atualização automática via Microsoft
            Graph API
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <StatusBadge status={status} message={statusMsg} />
          <button
            onClick={load}
            disabled={status === 'loading'}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </header>

      {error && <ErrorPanel message={error} />}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['ALL', ...sheets].map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={clsx(
                'rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition',
                filter === m
                  ? 'border-accent bg-accent text-white shadow-sm'
                  : 'border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground hover:bg-surface2',
              )}
            >
              {m === 'ALL' ? 'Todos' : m}
            </button>
          ))}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por item ou código SIMPAS..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-accent sm:w-[340px]"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-muted shadow-sm transition hover:bg-surface2 hover:text-foreground"
            >
              Limpar
            </button>
          )}
        </div>

        <p className="text-xs text-muted">
          {lastUpdate && `Atualizado às ${lastUpdate}`}
          {countdown && ` · próxima sincronização em ${countdown}`}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {searchQuery
            ? `${filtered.length} resultado(s) para "${searchQuery}"`
            : `${filtered.length} processo(s) no filtro atual`}
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon="💰"
          label="Total Empenhado"
          value={fmtBRL(kpis.total)}
          sub={`${kpis.fin} processos no financeiro`}
          accentColor="#2563eb"
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
          accentColor="#d97706"
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
          accentColor="#059669"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">
            <span className="text-accent">◈</span> Valor total por mês (R$)
          </p>
          {chartMes.labels.length > 0 && (
            <ChartMes labels={chartMes.labels} values={chartMes.values} />
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">
            <span className="text-accent">◈</span> Distribuição por setor
          </p>
          {chartSetor.labels.length > 0 && (
            <ChartSetor labels={chartSetor.labels} values={chartSetor.values} />
          )}
        </section>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">
            <span className="text-accent">◈</span> Top 8 itens por valor
          </p>
          {chartTop.labels.length > 0 && (
            <ChartTopItems labels={chartTop.labels} values={chartTop.values} />
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">
            <span className="text-accent">◈</span> Situação dos processos
          </p>
          <SituacaoBars data={sitMap} />
        </section>
      </div>

      <section className="mb-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">
          <span className="text-accent">◈</span> Tipo de RM
        </p>
        {chartRM.labels.length > 0 && (
          <ChartTipoRM labels={chartRM.labels} values={chartRM.values} />
        )}
      </section>

      <footer className="border-t border-border pt-4 text-center text-[0.72rem] text-muted">
        Compras 2026 · Microsoft Graph API · Igor Machado
      </footer>
    </div>
  );
}
