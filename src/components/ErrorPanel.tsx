'use client'

interface ErrorPanelProps {
  message: string
}

export default function ErrorPanel({ message }: ErrorPanelProps) {
  return (
    <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-4">
      <h3 className="mb-1.5 text-sm font-semibold text-red-300">
        ⚠ Erro ao carregar dados
      </h3>
      <p className="text-xs leading-relaxed text-red-400">
        {message}
        <br />
        <br />
        Verifique as variáveis de ambiente:{' '}
        <code className="rounded bg-black/30 px-1.5 py-0.5 text-[0.72rem]">
          TENANT_ID
        </code>{' '}
        <code className="rounded bg-black/30 px-1.5 py-0.5 text-[0.72rem]">
          CLIENT_ID
        </code>{' '}
        <code className="rounded bg-black/30 px-1.5 py-0.5 text-[0.72rem]">
          CLIENT_SECRET
        </code>{' '}
        <code className="rounded bg-black/30 px-1.5 py-0.5 text-[0.72rem]">
          WORKBOOK_ID
        </code>
      </p>
    </div>
  )
}
