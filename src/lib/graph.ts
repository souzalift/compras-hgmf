import type { ProcessRow } from '@/types'
import { cookies } from 'next/headers'

const RANGE = 'A1:N500'
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'
const AUTH_BASE = 'https://login.microsoftonline.com'
const COOKIE_NAME = 'ms_refresh_token'

function getTenantId() {
  return process.env.TENANT_ID || 'consumers'
}

function getRedirectUri() {
  const redirectUri = process.env.MS_REDIRECT_URI
  if (!redirectUri) {
    throw new Error('MS_REDIRECT_URI não configurado.')
  }

  return redirectUri
}

function getClientId() {
  const clientId = process.env.CLIENT_ID
  if (!clientId) {
    throw new Error('CLIENT_ID não configurado.')
  }
  return clientId
}

function getClientSecret() {
  const clientSecret = process.env.CLIENT_SECRET
  if (!clientSecret) {
    throw new Error(
      'CLIENT_SECRET não configurado. Para o fluxo Authorization Code no backend, crie um client secret no App Registration.'
    )
  }
  return clientSecret
}

function getScopes() {
  return [
    'openid',
    'profile',
    'email',
    'offline_access',
    'Files.ReadWrite',
    'User.Read',
  ].join(' ')
}

export function getMicrosoftLoginUrl() {
  const tenantId = getTenantId()
  const clientId = getClientId()
  const redirectUri = getRedirectUri()

  const url = new URL(`${AUTH_BASE}/${tenantId}/oauth2/v2.0/authorize`)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_mode', 'query')
  url.searchParams.set('scope', getScopes())
  url.searchParams.set('prompt', 'select_account')
  console.log('MS_REDIRECT_URI:', redirectUri)
  console.log('LOGIN URL:', url.toString())
  return url.toString()
}

export async function exchangeCodeForTokens(code: string) {
  const tenantId = getTenantId()
  const clientId = getClientId()
  const clientSecret = getClientSecret()
  const redirectUri = getRedirectUri()

  const res = await fetch(`${AUTH_BASE}/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      scope: getScopes(),
    }).toString(),
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok || !data.access_token) {
    throw new Error(
      `Falha ao trocar code por token: ${data.error_description || data.error || 'Erro desconhecido'}`
    )
  }

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresIn: data.expires_in as number | undefined,
  }
}

export async function saveRefreshToken(refreshToken: string) {
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  })
}

export async function clearRefreshToken() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getDelegatedToken(): Promise<string> {
  const tenantId = getTenantId()
  const clientId = getClientId()
  const clientSecret = getClientSecret()
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(COOKIE_NAME)?.value

  if (!refreshToken) {
    throw new Error(
      'Microsoft não autenticado. Acesse /api/auth/microsoft/login para conectar sua conta.'
    )
  }

  const res = await fetch(`${AUTH_BASE}/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: getRedirectUri(),
      scope: getScopes(),
    }).toString(),
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok || !data.access_token) {
    throw new Error(
      `Falha refresh_token: ${data.error_description || data.error || 'Erro desconhecido'}`
    )
  }

  if (data.refresh_token) {
    await saveRefreshToken(data.refresh_token as string)
  }

  return data.access_token as string
}

export async function getWorksheets(
  token: string,
  workbookId: string
): Promise<string[]> {
  const urls = buildUrls(workbookId, 'workbook/worksheets')

  for (const url of urls) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      return (data.value as Array<{ name: string }>).map((s) => s.name)
    }
  }

  throw new Error('Não foi possível listar as abas da planilha.')
}

export async function readSheet(
  token: string,
  workbookId: string,
  sheet: string
): Promise<(string | number | null)[][]> {
  const path = `workbook/worksheets/${encodeURIComponent(sheet)}/range(address='${RANGE}')`
  const urls = buildUrls(workbookId, path)

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (res.ok) {
        const data = await res.json()
        return data.values ?? []
      }
    } catch {
      // tenta a próxima URL
    }
  }

  return []
}

const MONTH_NAMES = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
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
    codItem: header.findIndex(
      (h) => h === 'COD. ITEM' || h === 'COD ITEM'
    ),
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

    const qty = parseFloat(String(r[idx.qty] ?? 0).replace(',', '.')) || 0
    const price = parseFloat(String(r[idx.price] ?? 0).replace(',', '.')) || 0
    const total =
      parseFloat(String(r[idx.total] ?? 0).replace(',', '.')) || qty * price

    const setor = normalizeSetor(String(r[idx.setor] ?? ''))
    if (!setor) continue

    rows.push({
      mes,
      setor,
      codigoItem: String(r[idx.codItem] ?? '').trim(),
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

function buildUrls(workbookId: string, path: string): string[] {
  const urls: string[] = []

  if (process.env.SITE_ID) {
    urls.push(`${GRAPH_BASE}/sites/${process.env.SITE_ID}/drive/items/${workbookId}/${path}`)
  }

  if (process.env.DRIVE_ID) {
    urls.push(`${GRAPH_BASE}/drives/${process.env.DRIVE_ID}/items/${workbookId}/${path}`)
  }

  urls.push(`${GRAPH_BASE}/me/drive/items/${workbookId}/${path}`)

  return urls
}

function normalizeSetor(s: string): string | null {
  const v = s
    .trim()
    .toUpperCase()
    .replace(/^MANUTENCAO$/, 'MANUTENÇÃO')
    .replace(/^LABORATORIO\s*$/, 'LABORATÓRIO')

  return v || null
}