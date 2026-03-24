import { NextResponse } from 'next/server'
import { getMicrosoftLoginUrl } from '@/lib/graph'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = getMicrosoftLoginUrl()
  return NextResponse.redirect(url)
}