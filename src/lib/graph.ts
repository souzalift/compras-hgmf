import type { ProcessRow } from '@/types'

const RANGE = 'A1:N500'

// ── Token delegado via ROPC (funciona com OneDrive pessoal e corporativo) ─────
// Usa as credenciais do usuário armazenadas nas variáveis de ambiente.
// Não requer interação do usuário nem redirect URI.
export async function getAppToken(): Promise<string> {
  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, MS_USERNAME, MS_PASSWORD } = process.env

  if (!TENANT_ID || !CLIENT_ID) {
    throw new Error('Variáveis de ambiente ausentes: TENANT_ID ou CLIENT_ID')
  }

  // Se tiver usuário/senha → ROPC (funciona com OneDrive pessoal)
  if (MS_USERNAME && MS_PASSWORD) {
    const res = await fetch(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: CLIENT_ID,
          ...(CLIENT_SECRET ? { client_secret: CLIENT_SECRET } : {}),
          username: MS_USERNAME,
          password: MS_PASSWORD,
          scope: 'https://graph.microsoft.com/Files.Read https://graph.microsoft.com/Sites.Read.All offline_access',
        }),
      }
    )
    const data = await res.json()
    if (!data.access_token) {
      throw new Error('Falha ROPC: ' + (data.error_description ?? JSON.stringify(data)))
    }
    return data.access_token as string
  }

  // Fallback → client_credentials (funciona apenas com SharePoint corporativo)
  if (!CLIENT_SECRET) {
    throw new Error(
      'Configure MS_USERNAME + MS_PASSWORD para OneDrive pessoal, ou CLIENT_SECRET para SharePoint corporativo.'
    )
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
      }),
    }
  )

  const data = await res.json()
  if (!data.access_token) {
    throw new Error('Falha client_credentials: ' + JSON.stringify(data))
  }
  return data.access_token as string
}

// ── Lista abas disponíveis ────────────────────────────────────────────────────
export async function getWorksheets(
  token: string,
  workbookId: string
): Promise<string[]> {
  const urls = buildUrls(workbookId, 'workbook/worksheets')
  for (const url of urls) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      return (data.value as Array<{ name: string }>).map((s) => s.name)
    }
  }
  throw new Error('Não foi possível listar as abas da planilha.')
}

// ── Lê uma aba ────────────────────────────────────────────────────────────────
export async function readSheet(
  token: string,
  workbookId: string,
  sheet: string
): Promise<(string | number | null)[][]> {
  const path = `workbook/worksheets/${encodeURIComponent(sheet)}/range(address='${RANGE}')`
  const urls = buildUrls(workbookId, path)

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        return data.values ?? []
      }
    } catch (_) {}
  }
  return []
}

// ── Parsing ───────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'JAN','FEV','MAR','ABR','MAI','JUN',
  'JUL','AGO','SET','OUT','NOV','DEZ',
]

export function isMonthSheet(name: string) {
  return MONTH_NAMES.includes(name.toUpperCase().trim())
}

export function parseSheet(
  mes: string,
  values: (string | number | null)[][]
): ProcessRow[] {
  if (values.length < 2) return []

  const header = values[0].map((h) => String(h ?? '').trim().toUpperCase())
  const idx = {
    setor: header.findIndex((h) => h === 'SETOR'),
    item: header.findIndex((h) => h === 'ITEM'),
    qty: header.findIndex((h) => h.includes('QTD ATD')),
    price: header.findIndex((h) => h === 'PREÇO' || h === 'PRECO'),
    total: header.findIndex((h) => h === 'TOTAL'),
    sit: header.findIndex((h) => h.includes('SITUA')),
    rm: header.findIndex((h) => h === 'TIPO DE RM'),
  }

  const rows: ProcessRow[] = []
  for (let i = 1; i < values.length; i++) {
    const r = values[i]
    if (!r || !r[0]) continue

    const qty = parseFloat(String(r[idx.qty] ?? 0)) || 0
    const price = parseFloat(String(r[idx.price] ?? 0)) || 0
    const total = parseFloat(String(r[idx.total] ?? 0)) || qty * price
    const setor = normalizeSetor(String(r[idx.setor] ?? ''))
    if (!setor) continue

    rows.push({
      mes,
      setor,
      item: String(r[idx.item] ?? '').substring(0, 100),
      total,
      qty,
      price,
      sit: String(r[idx.sit] ?? '').trim().toUpperCase(),
      rm: String(r[idx.rm] ?? '').trim(),
    })
  }
  return rows
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildUrls(workbookId: string, path: string): string[] {
  const base = 'https://graph.microsoft.com/v1.0'
  const urls: string[] = []

  if (process.env.SITE_ID) {
    urls.push(`${base}/sites/${process.env.SITE_ID}/drive/items/${workbookId}/${path}`)
  }
  if (process.env.DRIVE_ID) {
    urls.push(`${base}/drives/${process.env.DRIVE_ID}/items/${workbookId}/${path}`)
  }
  urls.push(`${base}/me/drive/items/${workbookId}/${path}`)
  return urls
}

function normalizeSetor(s: string): string | null {
  const v = s.trim().toUpperCase()
    .replace(/^MANUTENCAO$/, 'MANUTENÇÃO')
    .replace(/^LABORATORIO\s*$/, 'LABORATÓRIO')
  return v || null
}
