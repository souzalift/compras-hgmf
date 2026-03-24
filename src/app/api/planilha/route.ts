import { NextResponse } from 'next/server'
import {
  getDelegatedToken,
  getWorksheets,
  isMonthSheet,
  readSheet,
  parseSheet,
} from '@/lib/graph'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  console.log('\n[API /planilha] ── Iniciando ──')
  console.log(
    '[API] TENANT_ID       :',
    process.env.TENANT_ID ? `✓ ${process.env.TENANT_ID}` : '✗ AUSENTE'
  )
  console.log(
    '[API] CLIENT_ID       :',
    process.env.CLIENT_ID ? `✓ ${process.env.CLIENT_ID}` : '✗ AUSENTE'
  )
  console.log(
    '[API] CLIENT_SECRET   :',
    process.env.CLIENT_SECRET ? '✓ presente' : '✗ AUSENTE'
  )
  console.log(
    '[API] MS_REDIRECT_URI :',
    process.env.MS_REDIRECT_URI ? `✓ ${process.env.MS_REDIRECT_URI}` : '✗ AUSENTE'
  )
  console.log(
    '[API] WORKBOOK_ID     :',
    process.env.WORKBOOK_ID ? `✓ ${process.env.WORKBOOK_ID}` : '✗ AUSENTE'
  )

  try {
    const workbookId = process.env.WORKBOOK_ID
    if (!workbookId) {
      return NextResponse.json(
        { error: 'WORKBOOK_ID não configurado.' },
        { status: 500 }
      )
    }

    console.log('[API] Obtendo token delegado...')
    const token = await getDelegatedToken()
    console.log('[API] Token obtido ✓')

    console.log('[API] Listando abas...')
    const allSheets = await getWorksheets(token, workbookId)
    console.log('[API] Abas encontradas:', allSheets)

    const monthSheets = allSheets.filter(isMonthSheet)
    console.log('[API] Abas de mês:', monthSheets)

    const results = await Promise.all(
      monthSheets.map(async (sheet) => {
        const values = await readSheet(token, workbookId, sheet)
        console.log(`[API] Aba ${sheet}: ${values.length} linhas`)
        return parseSheet(sheet.toUpperCase(), values)
      })
    )

    const rows = results.flat()
    console.log('[API] Total registros:', rows.length, '\n')

    return NextResponse.json(
      {
        rows,
        updatedAt: new Date().toISOString(),
        sheets: monthSheets,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[API /planilha] ERRO:', message, '\n')

    return NextResponse.json(
      {
        error: message,
        needsMicrosoftLogin: message.includes('Microsoft não autenticado'),
        loginUrl: '/api/auth/microsoft/login',
      },
      { status: 500 }
    )
  }
}