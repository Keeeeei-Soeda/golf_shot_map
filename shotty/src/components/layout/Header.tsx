'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { toggleMenu, onGpsBtn, openScorecard, openHistory } from '@/app/golf/logic'

export default function Header() {
  const { data: session, status } = useSession()
  const [authMenuOpen, setAuthMenuOpen] = useState(false)

  return (
    <header>
      <button id="hbgBtn" className="hbg-btn" onClick={toggleMenu} title="メニュー">
        <span/><span/><span/>
      </button>
      <div className="logo">SHOTTY <small>caddy</small></div>
      <div className="hdr-right">
        <button id="gpsBtn" className="hdr-btn" onClick={onGpsBtn} title="GPS">📍</button>
        <button className="hdr-btn" onClick={openScorecard} title="スコアカード">📊</button>
        <div id="histBtn" style={{position:'relative'}}>
          <button className="hdr-btn" onClick={openHistory}>📋</button>
          <span id="histBadge" className="hist-badge" style={{display:'none'}}></span>
        </div>

        {/* 認証エリア */}
        <div className="auth-area" style={{position:'relative'}}>
          {status === 'loading' ? (
            <div style={{width:32,height:32,borderRadius:'50%',background:'#374151'}} />
          ) : session?.user ? (
            <>
              <button
                onClick={() => setAuthMenuOpen(v => !v)}
                className="hdr-btn"
                style={{
                  width:32, height:32, borderRadius:'50%', overflow:'hidden',
                  background:'#f97316', display:'flex', alignItems:'center',
                  justifyContent:'center', color:'white', fontWeight:'bold', fontSize:13,
                  padding:0,
                }}
                title="アカウントメニュー"
              >
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                ) : (
                  session.user.name?.[0]?.toUpperCase() ?? session.user.email?.[0]?.toUpperCase() ?? '?'
                )}
              </button>

              {authMenuOpen && (
                <div style={{
                  position:'absolute', right:0, top:40, width:192,
                  background:'#111827', border:'1px solid #374151',
                  borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,.5)', zIndex:200,
                }}>
                  <div style={{padding:'12px 16px', borderBottom:'1px solid #374151'}}>
                    <div style={{fontSize:14,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {session.user.name ?? 'ユーザー'}
                    </div>
                    <div style={{fontSize:12,color:'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {session.user.email ?? '—'}
                    </div>
                  </div>
                  <Link
                    href="/mypage"
                    style={{display:'block',padding:'8px 16px',fontSize:14,color:'white',textDecoration:'none'}}
                    onClick={() => setAuthMenuOpen(false)}
                  >
                    マイページ
                  </Link>
                  <Link
                    href="/mypage"
                    style={{display:'block',padding:'8px 16px',fontSize:14,color:'#86efac',textDecoration:'none'}}
                    onClick={() => setAuthMenuOpen(false)}
                  >
                    📖 ラウンド振り返り
                  </Link>
                  <button
                    onClick={() => { setAuthMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                    style={{display:'block',width:'100%',textAlign:'left',padding:'8px 16px',fontSize:14,color:'#f87171',background:'none',border:'none',cursor:'pointer'}}
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/auth/signin"
              style={{
                padding:'6px 12px', fontSize:13, background:'#f97316',
                color:'white', borderRadius:8, textDecoration:'none', fontWeight:500,
              }}
            >
              サインイン
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
