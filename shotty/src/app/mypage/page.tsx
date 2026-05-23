import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const SCORE_COLOR = (diff: number) =>
  diff <= -1 ? '#1E4E0B' : diff >= 2 ? '#4B1528' : diff === 1 ? '#412402' : '#374151'
const SCORE_BG = (diff: number) =>
  diff <= -1 ? '#C0DD97' : diff >= 2 ? '#F4C0D1' : diff === 1 ? '#FAC775' : '#f3f4f6'

const providerLabel = (p: string) =>
  ({ line: '💚 LINE', google: '🔵 Google', resend: '📧 メール' }[p] ?? p)

export default async function MyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      _count: { select: { rounds: true } },
      accounts: { select: { provider: true } },
    },
  })

  if (!user) redirect('/auth/signin')

  const rounds = await prisma.round.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 20,
    include: {
      holes: { where: { cupIn: true }, select: { par: true, totalShots: true, scoreDiff: true } },
    },
  })

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: '#fafaf8', color: '#0d1f0d' }}>
      <div style={{ maxWidth: 672, margin: '0 auto', padding: 24 }}>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>
            ← トップに戻る
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>マイページ</h1>
        </div>

        <section style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>プロフィール</h2>
          <div className="flex items-center gap-4">
            {user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" style={{ width: 64, height: 64, borderRadius: '50%' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name ?? 'ユーザー'}</div>
              <div style={{ fontSize: 14, color: '#4b5563', marginTop: 2 }}>
                {user.email ?? 'メール未登録'}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                ログイン方法：{user.accounts.map(a => providerLabel(a.provider)).join('、')}
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>現在のプラン</h2>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {user.subscription?.status === 'ACTIVE' ? '🌟 プレミアム' : '🆓 Free'}
          </div>
          {user.subscription?.status !== 'ACTIVE' && (
            <a
              href="/upgrade"
              style={{
                display: 'inline-block', marginTop: 12, padding: '8px 16px',
                background: '#f97316', color: 'white', borderRadius: 8,
                fontSize: 14, textDecoration: 'none', fontWeight: 500,
              }}
            >
              プレミアムにアップグレード
            </a>
          )}
        </section>

        <section style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>データサマリー</h2>
          <div style={{ fontSize: 16 }}>
            クラウドに保存されたラウンド数：
            <span style={{ fontWeight: 700 }}>{user._count.rounds}</span>
          </div>
        </section>

        <section style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>ラウンド履歴</h2>
          {rounds.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9ca3af' }}>まだラウンド記録がありません</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rounds.map(r => {
                const completedHoles = r.holes.length
                const totalScore = r.holes.reduce((s, h) => s + h.totalShots, 0)
                const totalPar   = r.holes.reduce((s, h) => s + h.par, 0)
                const diff = completedHoles > 0 ? totalScore - totalPar : null
                const diffLabel = diff == null ? null : diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`
                return (
                  <Link
                    key={r.id}
                    href={`/round/${r.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 10,
                      border: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit',
                      background: '#fafaf8',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.gcName}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {r.courseName}
                        <span style={{ margin: '0 6px', color: '#d1d5db' }}>·</span>
                        {r.date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {completedHoles > 0 && (
                          <span style={{ marginLeft: 6 }}>{completedHoles}H</span>
                        )}
                      </div>
                    </div>
                    {diff != null && diffLabel != null && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                          {totalScore}
                        </span>
                        <span
                          style={{
                            fontSize: 11, fontWeight: 600, padding: '1px 6px',
                            borderRadius: 20, background: SCORE_BG(diff), color: SCORE_COLOR(diff),
                          }}
                        >
                          {diffLabel}
                        </span>
                      </div>
                    )}
                    {diff == null && (
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>記録なし</span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
