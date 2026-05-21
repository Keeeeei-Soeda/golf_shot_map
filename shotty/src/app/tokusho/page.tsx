import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | Shotty Golf',
  description: '特定商取引法に基づく表記',
}

const items: { label: string; value: string | ReactNode }[] = [
  { label: '販売業者', value: '副田 圭一' },
  { label: '代表責任者', value: '副田 圭一' },
  {
    label: '所在地',
    value: (
      <>
        〒 ※メールにてお問い合わせいただいた場合、遅滞なく開示いたします
      </>
    ),
  },
  {
    label: '電話番号',
    value: 'メールにてお問い合わせください（お問い合わせ後、遅滞なく開示いたします）',
  },
  {
    label: 'メールアドレス',
    value: (
      <a
        href="mailto:support@shotty.net"
        className="text-green-400 underline"
      >
        support@shotty.net
      </a>
    ),
  },
  { label: 'サービスURL', value: 'https://shotty.net' },
  {
    label: '販売価格',
    value: 'Shotty プレミアムプラン　500円（税込）',
  },
  {
    label: '商品・サービスの内容',
    value:
      'ゴルフラウンド記録・AI解析・スイング分析などのプレミアム機能（Shotty Golf Webアプリ）',
  },
  {
    label: '支払方法',
    value: 'クレジットカード決済（Stripe）',
  },
  {
    label: '支払時期',
    value: 'ご注文手続き完了時にお支払いが確定します',
  },
  {
    label: '商品・サービスの引渡し時期',
    value: '決済完了後、直ちにご利用いただけます',
  },
  {
    label: '返品・キャンセルについて',
    value:
      'デジタルコンテンツの性質上、決済完了後の返金・キャンセルは原則承っておりません。ただし、サービスに重大な不具合が生じた場合はこの限りではありません。',
  },
  {
    label: '動作環境',
    value: 'インターネット接続環境および対応ブラウザ（Chrome・Safari・Firefox 最新版）',
  },
]

export default function TokushoPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">特定商取引法に基づく表記</h1>
        <p className="text-gray-400 text-sm mb-8">
          特定商取引に関する法律第11条に基づき、以下の情報を表示いたします。
        </p>

        <div className="divide-y divide-gray-800 border border-gray-800 rounded-lg overflow-hidden">
          {items.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row"
            >
              <dt className="w-full sm:w-40 shrink-0 bg-gray-900 px-4 py-3 text-sm font-medium text-gray-300">
                {label}
              </dt>
              <dd className="flex-1 px-4 py-3 text-sm text-gray-100 leading-relaxed">
                {value}
              </dd>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-500">
          最終更新：2026年5月
        </p>
      </div>
    </div>
  )
}
