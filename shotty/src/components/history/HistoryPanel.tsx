'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { closeHistory, exportCaddyNotes } from '@/app/golf/logic'

export default function HistoryPanel() {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user?.id

  return (
    <div id="histPanel">
      <div className="hist-hdr">
        <h2>📋 ラウンド履歴</h2>
        <button className="hist-close" onClick={closeHistory}>✕</button>
      </div>
      <div className="hist-list">
        {isLoggedIn && (
          <div style={{padding:'4px 0 8px'}}>
            <Link
              href="/mypage"
              onClick={closeHistory}
              style={{
                display:'block', width:'100%', padding:'8px 12px',
                background:'#185FA5', color:'white', borderRadius:8,
                fontSize:13, fontWeight:600, textAlign:'center',
                textDecoration:'none',
              }}
            >
              📊 クラウド履歴・振り返りを見る
            </Link>
          </div>
        )}
        <div style={{padding:'4px 0 8px'}}>
          <button className="sp-cancel" style={{width:'100%'}} onClick={exportCaddyNotes}>📤 caddy_notes.json をエクスポート</button>
        </div>
        <div id="histList" suppressHydrationWarning></div>
      </div>
    </div>
  )
}
