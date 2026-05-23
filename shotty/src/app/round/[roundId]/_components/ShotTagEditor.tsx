'use client'

import { useState, useTransition } from 'react'
import { ShotTagPicker, type ShotTagState } from '@/components/map/ShotTagPicker'
import { useRouter } from 'next/navigation'

interface Props {
  shotId: string
  shotNo: number
  club: string | null
  initial: ShotTagState
  onClose: () => void
}

export function ShotTagEditor({ shotId, shotNo, club, initial, onClose }: Props) {
  const [tags, setTags] = useState<ShotTagState>(initial)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSave = () => {
    startTransition(async () => {
      await fetch(`/api/shots/${shotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tags),
      })
      router.refresh()
      onClose()
    })
  }

  return (
    // バックドロップ
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl shadow-2xl pb-safe"
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-zinc-100">
          <div>
            <div className="text-sm font-semibold text-zinc-900">
              {shotNo}打目のタグを編集
            </div>
            {club && (
              <div className="text-xs text-[#185FA5] font-medium mt-0.5">{club}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-lg leading-none w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* タグピッカー */}
        <div className="py-2">
          <ShotTagPicker value={tags} onChange={setTags} />
        </div>

        {/* フッター */}
        <div className="flex gap-2 px-3 pb-4 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {isPending ? '保存中...' : '保存する'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 border border-zinc-200 text-zinc-600 rounded-xl text-sm"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}
