import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Compras 2026 — Dashboard',
  description: 'Controle de processos de aquisição em tempo real',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
