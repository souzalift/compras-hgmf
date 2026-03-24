'use client';

interface ErrorPanelProps {
  message: string;
}

export default function ErrorPanel({ message }: ErrorPanelProps) {
  return (
    <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-lg">⚠️</div>

        <div>
          <h3 className="mb-1 text-sm font-semibold text-red-600 dark:text-red-400">
            Erro ao carregar dados
          </h3>

          <p className="text-xs leading-relaxed text-red-600/90 dark:text-red-300/90">
            {message}
          </p>

          <div className="mt-3 text-xs text-muted">
            Verifique as variáveis de ambiente:
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {['TENANT_ID', 'CLIENT_ID', 'CLIENT_SECRET', 'WORKBOOK_ID'].map(
              (env) => (
                <code
                  key={env}
                  className="rounded-md border border-border bg-surface2 px-2 py-1 text-[11px] font-medium text-foreground"
                >
                  {env}
                </code>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
