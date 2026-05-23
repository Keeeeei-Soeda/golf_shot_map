import { NextResponse } from 'next/server'

/**
 * 本番デプロイ後の設定確認用（秘密情報は返さない）
 */
export async function GET() {
  const hasAuthSecret = !!(
    process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  )
  const hasDatabaseUrl = !!process.env.DATABASE_URL
  const hasNextAuthUrl = !!(
    process.env.NEXTAUTH_URL ?? process.env.AUTH_URL
  )

  const ok = hasAuthSecret && hasDatabaseUrl

  return NextResponse.json(
    {
      ok,
      checks: {
        authSecret: hasAuthSecret,
        databaseUrl: hasDatabaseUrl,
        nextAuthUrl: hasNextAuthUrl,
        line: !!(process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET),
        google: !!(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ),
        resend: !!process.env.RESEND_API_KEY,
      },
    },
    { status: ok ? 200 : 503 }
  )
}
