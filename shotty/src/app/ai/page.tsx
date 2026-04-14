'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'

const CHATS_KEY = 'golfAiChats'
const MAX_HISTORY = 40

const SYSTEM_PROMPT = `あなたは「Golf System Architect & Debugger」です。ユーザーの「100切り」を最短で達成させるための戦略的キャディかつデータサイエンティストとして振る舞ってください。

■ 性格・スタンス
- 冷静沈着（Stoic）: ミスショットをしても動揺せず、淡々と次の「リカバリー最適解」を提示する。感情的な励ましよりも論理的なデータを示す。
- リスク回避型（Risk-Averse）: OB・池・バンカー・3パットを徹底的に避けることを優先する。
- 期待値重視: 「成功率20%の180ydショット」よりも「成功率80%の100ydショット」を推奨する。

■ 思考アルゴリズム（行動指針）
- 「ボギーはパー」理論: 100切りには「オールボギー（90）」で十分。常に「ボギーオン」を正解とし、無理なパーオン狙いを制止する。
- ハザードのデバッグ: 常に「最もやってはいけないミス（右OBなど）」を特定し、物理的に回避するアドレスと番手を提案する。
- クラブ特性の把握: ユーザーの個別の癖（フック傾向など）とクラブ仕様を計算に入れたマネジメントを行う。

■ 制約（必ず守ること）
- 「一か八か」「気合で」というアドバイスは絶対禁止。
- 常に「全ホールボギーで90」であることをリマインドして100切りを目指させる。
- ゴルフ以外の話題には「申し訳ありませんが、私はゴルフ専用AIです。」とだけ答える。
- 回答は日本語で行う。`

interface Message {
  role: 'user' | 'assistant'
  content: string
}
interface Chat {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: Message[]
}

/** localStorage の golfRounds 用（型は緩めにしつつ any を避ける） */
interface StoredRound {
  date?: string
  gcName?: string
  courseName?: string
  shots: Record<string, unknown>
}
interface StoredShot {
  no: number
  isPenalty?: boolean
  club?: string
  carry?: number
  remaining?: number
  result?: string
}

function buildContext(): string {
  let ctx = '\n\n━━━━━━━━━━ ユーザーデータ ━━━━━━━━━━'
  try {
    const clubs = JSON.parse(localStorage.getItem('golfClubSet') || '[]') as string[]
    const valid = clubs.filter(c => c && c.trim())
    if (valid.length) ctx += `\n\n▼ クラブセット構成\n${valid.join('、')}`
  } catch {}
  try {
    const rounds = JSON.parse(localStorage.getItem('golfRounds') || '[]') as StoredRound[]
    if (rounds.length) {
      ctx += '\n\n▼ 直近のラウンドデータ（最新3件）'
      rounds.slice(0, 3).forEach(r => {
        ctx += `\n\n[${r.date}] ${r.gcName} ${r.courseName}`
        const results: string[] = []
        Object.entries(r.shots).forEach(([key, val]) => {
          if (key.includes('_meta') || !Array.isArray(val)) return
          const parts = key.split('_')
          if (parts.length < 3) return
          const hIdx = parseInt(parts[2])
          const meta = (r.shots[key + '_meta'] as Record<string, unknown> | undefined) || {}
          if (!meta.cupIn) return
          const score = (meta.totalShots as number | undefined) || val.length
          const par = meta.par ?? '?'
          const diff = (meta.scoreDiff as number | undefined) || 0
          const diffS = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : String(diff)
          const shotsArr = val as StoredShot[]
          const details = shotsArr.slice(0, 5).filter(s => !s.isPenalty && s.club)
            .map(s => `${s.no}打:${s.club} ${s.carry}yd`).join(' / ')
          const evals = shotsArr.filter(s => s.result).map(s => `${s.no}打=${s.result}`).join(',')
          results.push(`H${hIdx + 1} PAR${par} ${score}打${diffS}${evals ? ` (${evals})` : ''}${details ? ` [${details}]` : ''}`)
        })
        if (results.length) ctx += '\n' + results.join('\n')
      })
    }
  } catch {}
  ctx += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  return ctx
}

function renderMd(text: string): string {
  let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*(.*?)\*/g, '<em>$1</em>')
  s = s.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,.1);padding:1px 4px;border-radius:3px">$1</code>')
  s = s.replace(/^---$/gm, '<hr style="border-color:rgba(255,255,255,.2);margin:8px 0">')
  s = s.replace(/((?:^- .+\n?)+)/gm, (m) => {
    const items = m.trim().split('\n').map(l => `<li>${l.slice(2)}</li>`).join('')
    return `<ul style="padding-left:18px;margin:4px 0">${items}</ul>`
  })
  s = s.replace(/((?:^\d+\. .+\n?)+)/gm, (m) => {
    const items = m.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('')
    return `<ol style="padding-left:18px;margin:4px 0">${items}</ol>`
  })
  s = s.replace(/\n/g, '<br>')
  return s
}

const QUICK_QUESTIONS = [
  { label: '📊 ラウンド振り返り', q: '今週のラウンドを振り返って課題を教えて' },
  { label: '🏌️ ドライバー相談', q: 'ドライバーの意識、今はどんな感じがいい？' },
  { label: '📐 番手選択相談', q: '残り150yd、何番アイアンが安全？' },
  { label: '🎯 練習メニュー', q: '今日の練習メニューを組んでください' },
  { label: '🏆 100切り戦略', q: '100切りのための優先課題を教えて' },
]

export default function AiPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]') as Chat[]
      setChats(saved)
    } catch {}
  }, [])

  const saveChats = useCallback((updated: Chat[]) => {
    const trimmed = updated.slice(0, 60)
    localStorage.setItem(CHATS_KEY, JSON.stringify(trimmed))
    setChats(trimmed)
  }, [])

  const currentChat = chats.find(c => c.id === currentId) ?? null

  const scrollBottom = () => {
    setTimeout(() => {
      if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }, 50)
  }

  const newChat = useCallback(() => {
    const chat: Chat = { id: 'c' + Date.now(), title: '新しいチャット', createdAt: Date.now(), updatedAt: Date.now(), messages: [] }
    saveChats([chat, ...chats])
    setCurrentId(chat.id)
    setSidebarOpen(false)
  }, [chats, saveChats])

  const deleteChat = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('このチャットを削除しますか？')) return
    const updated = chats.filter(c => c.id !== id)
    saveChats(updated)
    if (currentId === id) setCurrentId(null)
  }, [chats, currentId, saveChats])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    let chat = currentChat
    if (!chat) {
      chat = { id: 'c' + Date.now(), title: '新しいチャット', createdAt: Date.now(), updatedAt: Date.now(), messages: [] }
    }
    const userMsg: Message = { role: 'user', content: text }
    chat = { ...chat, messages: [...chat.messages, userMsg], title: chat.title === '新しいチャット' ? text.slice(0, 26) + (text.length > 26 ? '…' : '') : chat.title, updatedAt: Date.now() }
    const updated = chats.filter(c => c.id !== chat!.id)
    const newChats = [chat, ...updated]
    saveChats(newChats)
    setCurrentId(chat.id)
    setInput('')
    setLoading(true)
    setStreamText('')
    scrollBottom()
    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT + buildContext() },
        ...chat.messages.slice(-MAX_HISTORY),
      ]
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'APIエラー')
      const content: string = data.content
      // タイプライター効果
      const charsPerFrame = content.length < 200 ? 2 : content.length < 600 ? 5 : 10
      let pos = 0
      await new Promise<void>(resolve => {
        const tick = () => {
          pos = Math.min(pos + charsPerFrame, content.length)
          setStreamText(content.slice(0, pos))
          scrollBottom()
          if (pos < content.length) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      })
      setStreamText('')
      const aiMsg: Message = { role: 'assistant', content }
      const finalChat = { ...chat, messages: [...chat.messages, aiMsg], updatedAt: Date.now() }
      const finalChats = newChats.map(c => c.id === finalChat.id ? finalChat : c)
      saveChats(finalChats)
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e)
      setStreamText(`⚠️ エラーが発生しました\n\n${errMsg}`)
    } finally {
      setLoading(false)
      scrollBottom()
    }
  }, [chats, currentChat, loading, saveChats])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const messages = currentChat?.messages ?? []

  return (
    <>
      <style>{`
        :root{--gd:#0f1f0f;--g1:#162816;--g2:#1e3a1e;--g3:#2d4f2d;--g4:#3d6b3d;--gv:#4caf50;--w:#eef4ee;--gr:#7a957a;--acc:#e8c84a;--red:#e05252;}
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;background:var(--gd);color:var(--w);font-family:'Noto Sans JP',sans-serif;}
        .ai-root{display:flex;height:100vh;overflow:hidden;}
        /* デスクトップ: サイドバー常時表示 */
        .ai-sidebar{width:240px;flex-shrink:0;background:var(--g1);border-right:2px solid var(--g3);display:flex;flex-direction:column;height:100vh;transition:transform .28s ease;z-index:60;}
        @media(min-width:641px){.ai-sidebar{transform:none !important;position:relative;}}
        /* モバイル: スライド開閉 */
        @media(max-width:640px){
          .ai-sidebar{position:fixed;top:0;left:0;bottom:0;}
          .ai-sidebar.closed{transform:translateX(-100%);}
        }
        .sb-header{padding:14px 12px 10px;border-bottom:1px solid var(--g3);}
        .sb-logo{font-size:14px;font-weight:700;color:var(--acc);margin-bottom:8px;letter-spacing:2px;}
        .new-chat-btn{width:100%;padding:10px;border-radius:8px;border:1px dashed var(--gv);background:transparent;color:var(--gv);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;}
        .new-chat-btn:hover{background:rgba(76,175,80,.15);}
        .chat-list{flex:1;overflow-y:auto;padding:8px 6px;}
        .chat-item{display:flex;align-items:center;gap:6px;padding:9px 10px;border-radius:8px;cursor:pointer;transition:background .15s;margin-bottom:2px;}
        .chat-item:hover{background:var(--g2);}
        .chat-item.active{background:var(--g3);}
        .chat-item-title{flex:1;font-size:12px;color:var(--w);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .chat-item-del{background:none;border:none;color:var(--gr);cursor:pointer;font-size:13px;padding:2px 5px;border-radius:4px;opacity:0;transition:opacity .15s;}
        .chat-item:hover .chat-item-del{opacity:1;}
        .chat-item-del:hover{color:var(--red);}
        .sb-footer{padding:10px;border-top:1px solid var(--g3);}
        .sb-back-btn{width:100%;padding:8px;border-radius:8px;border:1px solid var(--g4);background:var(--g3);color:var(--w);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;}
        .sb-back-btn:hover{background:var(--g4);}
        .ai-main{flex:1;display:flex;flex-direction:column;height:100vh;overflow:hidden;min-width:0;}
        .ai-header{height:48px;flex-shrink:0;background:linear-gradient(135deg,#0a160a,var(--g1));border-bottom:2px solid var(--gv);display:flex;align-items:center;gap:10px;padding:0 12px;}
        .hbg-btn{background:none;border:none;color:var(--w);font-size:22px;cursor:pointer;padding:4px;}
        /* デスクトップではハンバーガーボタン非表示 */
        @media(min-width:641px){.hbg-btn{display:none;}}
        .ai-header-title{font-size:14px;font-weight:700;color:var(--acc);letter-spacing:2px;}
        #messages{flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:14px;}
        .welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:32px 20px;text-align:center;gap:12px;}
        .wl-icon{font-size:52px;}
        .wl-title{font-size:24px;font-weight:700;color:var(--acc);letter-spacing:3px;}
        .wl-sub{font-size:13px;color:var(--gr);line-height:1.9;max-width:400px;}
        .wl-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:6px;}
        .wl-chip{padding:8px 14px;border-radius:20px;border:1px solid var(--g4);background:var(--g2);color:var(--w);font-size:12px;cursor:pointer;transition:all .15s;font-family:inherit;}
        .wl-chip:hover{border-color:var(--gv);color:var(--gv);}
        .msg-wrap{display:flex;gap:10px;align-items:flex-start;}
        .msg-wrap.user{flex-direction:row-reverse;}
        .msg-avatar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;background:var(--g3);margin-top:2px;}
        .msg-wrap.user .msg-avatar{background:var(--gv);color:#000;}
        .msg-bubble{max-width:74%;padding:11px 15px;border-radius:16px;font-size:14px;line-height:1.75;word-break:break-word;background:var(--g2);border:1px solid var(--g3);}
        .msg-wrap.user .msg-bubble{background:var(--gv);color:#000;font-weight:500;border:none;border-radius:16px 16px 4px 16px;}
        .msg-wrap.ai .msg-bubble{border-radius:16px 16px 16px 4px;}
        .typing-cursor::after{content:'▋';animation:blink 1s infinite;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .ai-input-area{flex-shrink:0;border-top:1px solid var(--g3);padding:12px 16px;background:var(--g1);display:flex;gap:8px;align-items:flex-end;}
        .ai-input{flex:1;background:var(--g2);border:1px solid var(--g3);border-radius:10px;padding:10px 14px;color:var(--w);font-size:14px;font-family:inherit;resize:none;outline:none;min-height:44px;max-height:140px;line-height:1.6;}
        .ai-input:focus{border-color:var(--gv);}
        .send-btn{background:var(--gv);border:none;border-radius:10px;color:#000;font-size:13px;font-weight:700;cursor:pointer;padding:10px 16px;font-family:inherit;flex-shrink:0;height:44px;transition:opacity .15s;}
        .send-btn:disabled{opacity:.5;cursor:not-allowed;}
        .overlay{display:none;position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.55);}
        .overlay.show{display:block;}
        /* モバイル: サイドバーが閉じているときの「メニューを表示」ボタン */
        .menu-show-btn{display:none;position:fixed;bottom:16px;left:16px;z-index:45;padding:8px 14px;border-radius:20px;border:1px solid var(--g4);background:var(--g2);color:var(--w);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;}
        .menu-show-btn:hover{background:var(--g3);}
        @media(max-width:640px){.menu-show-btn{display:block;}}
      `}</style>
      <div className="ai-root">
        {/* サイドバー */}
        <div className={`ai-sidebar${sidebarOpen ? '' : ' closed'}`}>
          <div className="sb-header">
            <div className="sb-logo">⛳ Golf AI</div>
            <button className="new-chat-btn" onClick={newChat}>＋ 新しいチャット</button>
          </div>
          <div className="chat-list">
            {chats.length === 0
              ? <div style={{padding:'20px',textAlign:'center',color:'var(--gr)',fontSize:'12px'}}>チャットがありません</div>
              : chats.map(c => (
                <div key={c.id} className={`chat-item${c.id === currentId ? ' active' : ''}`} onClick={() => { setCurrentId(c.id); setSidebarOpen(false) }}>
                  <div className="chat-item-title">💬 {c.title}</div>
                  <button className="chat-item-del" onClick={e => deleteChat(c.id, e)}>✕</button>
                </div>
              ))
            }
          </div>
          <div className="sb-footer">
            <Link
              href="/swing"
              prefetch={false}
              className="sb-back-btn"
              style={{ display: 'block', marginBottom: '6px', borderColor: 'var(--gv)', color: 'var(--gv)', textAlign: 'center', textDecoration: 'none' }}
            >
              🎥 スイング解析
            </Link>
            <Link href="/" prefetch={false} className="sb-back-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              ← メニューを表示
            </Link>
          </div>
        </div>

        {/* メインエリア */}
        <div className="ai-main">
          <div className="ai-header">
            <button className="hbg-btn" onClick={() => setSidebarOpen(v => !v)}>☰</button>
            <div className="ai-header-title">Golf AI Architect</div>
          </div>

          <div id="messages" ref={messagesRef}>
            {messages.length === 0 && !streamText ? (
              <div className="welcome">
                <div className="wl-icon">⛳</div>
                <div className="wl-title">Golf System Architect</div>
                <div className="wl-sub">
                  あなた専属のゴルフ戦略AIです。<br/>
                  過去のラウンドデータとクラブセットを参照し、<br/>
                  最適な100切り戦略をアドバイスします。
                </div>
                <div className="wl-chips">
                  {QUICK_QUESTIONS.map(q => (
                    <button key={q.label} className="wl-chip" onClick={() => sendMessage(q.q)}>{q.label}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`msg-wrap ${m.role === 'user' ? 'user' : 'ai'}`}>
                    <div className="msg-avatar">{m.role === 'user' ? '👤' : '⛳'}</div>
                    <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: m.role === 'user' ? m.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : renderMd(m.content) }} />
                  </div>
                ))}
                {(loading || streamText) && (
                  <div className="msg-wrap ai">
                    <div className="msg-avatar">⛳</div>
                    <div className={`msg-bubble${!streamText ? ' typing-cursor' : ''}`} dangerouslySetInnerHTML={{ __html: streamText ? renderMd(streamText) : '' }} />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="ai-input-area">
            <textarea
              ref={inputRef}
              className="ai-input"
              placeholder="ゴルフについて何でも聞いてください..."
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px' }}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="send-btn" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
              {loading ? '…' : '送信'}
            </button>
          </div>
        </div>
      </div>

      {/* モバイル: サイドバーが閉じているときのメニューボタン */}
      {!sidebarOpen && (
        <button className="menu-show-btn" onClick={() => setSidebarOpen(true)}>☰ メニューを表示</button>
      )}
      {sidebarOpen && <div className="overlay show" onClick={() => setSidebarOpen(false)} />}
    </>
  )
}
