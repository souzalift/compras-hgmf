import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, saveRefreshToken } from '@/lib/graph'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')
  const errorDescription = request.nextUrl.searchParams.get('error_description')

  if (error) {
    return NextResponse.json(
      {
        error,
        errorDescription,
      },
      { status: 400 }
    )
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Code não retornado pelo login Microsoft.' },
      { status: 400 }
    )
  }

  try {
    const { refreshToken } = await exchangeCodeForTokens(code)

    if (!refreshToken) {
      return NextResponse.json(
        {
          error:
            'A Microsoft não retornou refresh_token. Verifique escopo offline_access e configuração do app.',
        },
        { status: 500 }
      )
    }

    await saveRefreshToken(refreshToken)

    return NextResponse.redirect(new URL('/api/planilha', request.url))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}