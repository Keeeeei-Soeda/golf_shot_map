'use client'

import Link from 'next/link'
import { useState, useRef, useCallback, useEffect } from 'react'

type DiagnosisItem = { title: string; detail: string }

type AnalysisResult = {
  score: number
  summary: string
  diagnosis_items: DiagnosisItem[]
  points: {
    setup: string
    swing: string
    impact: string
  }
  debug_code: string
}

function normalizeSwingResult(raw: Record<string, unknown>): AnalysisResult {
  const score = typeof raw.score === 'number' ? raw.score : Number(raw.score) || 0
  const summary = String(raw.summary ?? '')
  const pointsRaw = raw.points as Record<string, unknown> | undefined
  const points = {
    setup: String(pointsRaw?.setup ?? ''),
    swing: String(pointsRaw?.swing ?? ''),
    impact: String(pointsRaw?.impact ?? ''),
  }
  const debug_code = String(raw.debug_code ?? '')
  const rawItems = raw.diagnosis_items
  if (Array.isArray(rawItems) && rawItems.length >= 3) {
    const diagnosis_items = rawItems.slice(0, 3).map((it) => {
      const o = it as Record<string, unknown>
      return {
        title: String(o.title ?? '診断項目'),
        detail: String(o.detail ?? ''),
      }
    })
    return { score, summary, diagnosis_items, points, debug_code }
  }
  const diagnosis_items: DiagnosisItem[] = [
    { title: '診断 ①（全体・優先課題）', detail: summary || '動画から読み取れる優先課題をここに書いてください。' },
    { title: '診断 ②（セットアップ〜バック）', detail: points.setup || 'セットアップ〜バックスイングの観点で補足。' },
    { title: '診断 ③（ダウン〜フィニッシュ）', detail: points.impact || points.swing || 'インパクト以降の観点で補足。' },
  ]
  return { score, summary, diagnosis_items, points, debug_code }
}

function ScoreRing({ score }: { score: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const pct = score / 100
  const color = score >= 75 ? '#4caf50' : score >= 50 ? '#e8c84a' : '#e05252'
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#2d4f2d" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dasharray .8s ease' }}
      />
      <text x="48" y="44" textAnchor="middle" fill={color} fontSize="22" fontWeight="700" fontFamily="sans-serif">{score}</text>
      <text x="48" y="60" textAnchor="middle" fill="#7a957a" fontSize="10" fontFamily="sans-serif">/ 100</text>
    </svg>
  )
}

export default function SwingPage() {
  const [angle, setAngle] = useState<'side' | 'front'>('side')
  const [memo, setMemo] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activePoint, setActivePoint] = useState<'setup' | 'swing' | 'impact'>('setup')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('動画ファイル（MP4・MOV・WebM など）を選択してください')
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('ファイルサイズは 100MB 以下にしてください')
      return
    }
    setError(null)
    setResult(null)
    setVideoFile(file)
    setVideoUrl(URL.createObjectURL(file))
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dropRef.current?.classList.remove('drag-over')
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    dropRef.current?.classList.add('drag-over')
  }
  const onDragLeave = () => dropRef.current?.classList.remove('drag-over')

  const analyze = useCallback(async () => {
    if (!videoFile || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string
          resolve(res.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(videoFile)
      })

      const res = await fetch('/api/swing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64: base64,
          mimeType: videoFile.type,
          angle,
          memo,
        }),
      })

      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'APIエラー')
      setResult(normalizeSwingResult(data.result as Record<string, unknown>))
      setActivePoint('setup')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [videoFile, angle, memo, loading])

  useEffect(() => {
    if (!result) return
    const el = document.getElementById('swing-result-anchor')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [result])

  const css = `
        :root{--gd:#0f1f0f;--g1:#162816;--g2:#1e3a1e;--g3:#2d4f2d;--g4:#3d6b3d;--gv:#4caf50;--w:#eef4ee;--gr:#7a957a;--acc:#e8c84a;--red:#e05252;}
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{min-height:100%;height:auto;overflow-x:hidden;overflow-y:auto;background:var(--gd);color:var(--w);font-family:'Noto Sans JP',sans-serif;-webkit-overflow-scrolling:touch;}
        .sw-root{max-width:680px;margin:0 auto;padding:16px 16px max(56px, env(safe-area-inset-bottom, 0px) + 40px);min-height:100vh;}
        .sw-header{display:flex;align-items:center;gap:12px;padding:12px 0 20px;border-bottom:2px solid var(--g3);margin-bottom:20px;}
        .sw-back{display:inline-block;background:none;border:1px solid var(--g3);border-radius:8px;color:var(--gr);font-size:12px;font-weight:700;cursor:pointer;padding:6px 12px;font-family:inherit;transition:all .15s;}
        .sw-back:hover{border-color:var(--gv);color:var(--gv);}
        .sw-title{font-size:18px;font-weight:700;color:var(--acc);letter-spacing:2px;}
        .sw-sub{font-size:11px;color:var(--gr);margin-top:2px;}
        .angle-row{display:flex;gap:8px;margin-bottom:16px;}
        .angle-btn{flex:1;padding:10px;border-radius:10px;border:1px solid var(--g3);background:var(--g2);color:var(--gr);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;}
        .angle-btn.sel{border-color:var(--gv);background:rgba(76,175,80,.15);color:var(--gv);}
        .angle-btn:hover:not(.sel){border-color:var(--g4);color:var(--w);}
        .drop-zone{border:2px dashed var(--g3);border-radius:14px;background:var(--g2);padding:32px 20px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:14px;position:relative;}
        .drop-zone.drag-over{border-color:var(--gv);background:rgba(76,175,80,.08);}
        .drop-zone:hover{border-color:var(--g4);}
        .dz-icon{font-size:40px;margin-bottom:8px;}
        .dz-label{font-size:14px;color:var(--w);font-weight:700;margin-bottom:4px;}
        .dz-sub{font-size:11px;color:var(--gr);}
        .dz-file-info{font-size:12px;color:var(--gv);margin-top:8px;font-weight:700;}
        .video-preview{width:100%;border-radius:12px;background:#000;max-height:240px;display:block;margin-bottom:14px;}
        .memo-label{font-size:12px;color:var(--gr);margin-bottom:6px;font-weight:700;}
        .memo-input{width:100%;background:var(--g2);border:1px solid var(--g3);border-radius:10px;padding:10px 14px;color:var(--w);font-size:13px;font-family:inherit;resize:none;outline:none;min-height:52px;max-height:100px;line-height:1.6;margin-bottom:14px;}
        .memo-input:focus{border-color:var(--gv);}
        .memo-input::placeholder{color:var(--gr);}
        .analyze-btn{width:100%;padding:14px;border-radius:12px;border:none;background:var(--gv);color:#000;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s;margin-bottom:20px;}
        .analyze-btn:disabled{opacity:.45;cursor:not-allowed;}
        .analyze-btn:not(:disabled):hover{opacity:.85;}
        .error-box{background:rgba(224,82,82,.12);border:1px solid var(--red);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--red);margin-bottom:16px;}
        .loading-box{text-align:center;padding:32px 0;color:var(--gr);}
        .spinner{width:44px;height:44px;border:4px solid var(--g3);border-top-color:var(--gv);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .result-card{background:var(--g1);border:1px solid var(--g3);border-radius:16px;overflow:hidden;}
        .result-hero{background:linear-gradient(135deg,#0a160a,var(--g2));padding:20px;display:flex;align-items:center;gap:20px;border-bottom:1px solid var(--g3);}
        .result-summary{flex:1;}
        .result-summary-label{font-size:11px;color:var(--gr);font-weight:700;letter-spacing:1px;margin-bottom:4px;}
        .result-summary-text{font-size:15px;color:var(--w);line-height:1.6;font-weight:500;}
        .point-tabs{display:flex;border-bottom:1px solid var(--g3);}
        .point-tab{flex:1;padding:10px 6px;background:none;border:none;border-bottom:2px solid transparent;color:var(--gr);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;}
        .point-tab.active{color:var(--acc);border-bottom-color:var(--acc);}
        .point-tab:hover:not(.active){color:var(--w);}
        .point-body{padding:16px 18px;font-size:14px;line-height:1.8;color:var(--w);min-height:80px;}
        .drill-box{background:rgba(76,175,80,.1);border:1px solid rgba(76,175,80,.3);border-radius:12px;padding:14px 16px;margin:0 18px 18px;}
        .drill-label{font-size:11px;color:var(--gv);font-weight:700;letter-spacing:1px;margin-bottom:6px;}
        .drill-text{font-size:14px;color:var(--w);line-height:1.7;}
        .sw-dx-list{display:flex;flex-direction:column;gap:10px;padding:0 14px 16px;border-bottom:1px solid var(--g3);}
        .sw-dx-item{background:var(--g2);border:1px solid var(--g3);border-radius:10px;padding:12px 14px;}
        .sw-dx-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
        .sw-dx-no{font-size:11px;font-weight:700;color:var(--gv);min-width:1.5em;}
        .sw-dx-title{font-size:13px;font-weight:700;color:var(--acc);}
        .sw-dx-detail{font-size:13px;line-height:1.8;color:var(--w);}
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="sw-root">
        {/* ヘッダー */}
        <div className="sw-header">
          <Link href="/ai" prefetch={false} className="sw-back" style={{ textDecoration: 'none' }}>
            ← AI相談
          </Link>
          <div>
            <div className="sw-title">🎥 スイング解析</div>
            <div className="sw-sub">動画をアップロードして Shotty にコードレビューしてもらおう</div>
          </div>
        </div>

        {/* 撮影角度選択 */}
        <div style={{ fontSize: '12px', color: 'var(--gr)', fontWeight: 700, marginBottom: '8px' }}>撮影方向</div>
        <div className="angle-row">
          <button className={`angle-btn${angle === 'side' ? ' sel' : ''}`} onClick={() => setAngle('side')}>🎯 後方（飛球線後方）</button>
          <button className={`angle-btn${angle === 'front' ? ' sel' : ''}`} onClick={() => setAngle('front')}>👁 正面（ターゲット方向）</button>
        </div>

        {/* 動画アップロード */}
        <div
          ref={dropRef}
          className="drop-zone"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="dz-icon">{videoFile ? '🎬' : '📱'}</div>
          <div className="dz-label">{videoFile ? '動画を変更' : '動画をドロップ、またはタップして選択'}</div>
          <div className="dz-sub">MP4・MOV・WebM ／ 最大 30 秒・100MB</div>
          {videoFile && <div className="dz-file-info">✅ {videoFile.name}（{(videoFile.size / 1024 / 1024).toFixed(1)} MB）</div>}
        </div>

        {/* 動画プレビュー */}
        {videoUrl && (
          <video className="video-preview" src={videoUrl} controls playsInline muted />
        )}

        {/* メモ入力 */}
        <div className="memo-label">特に見てほしい点（任意）</div>
        <textarea
          className="memo-input"
          placeholder="例：インパクトでのフェースの開き（右へのミスの原因）をデバッグしてください"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          rows={2}
        />

        {/* 解析ボタン */}
        <button
          className="analyze-btn"
          onClick={analyze}
          disabled={!videoFile || loading}
        >
          {loading ? '解析中...' : '🔍 Shotty に解析させる'}
        </button>

        {/* エラー */}
        {error && <div className="error-box">⚠️ {error}</div>}

        {/* ローディング */}
        {loading && (
          <div className="loading-box">
            <div className="spinner" />
            <div style={{ fontSize: '13px' }}>Shotty がスイングをデバッグ中...</div>
            <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--gr)' }}>動画の長さにより 15〜30 秒かかります</div>
          </div>
        )}

        {/* 解析結果 */}
        {result && (
          <div className="result-card" id="swing-result-anchor">
            {/* スコア＋要約 */}
            <div className="result-hero">
              <ScoreRing score={result.score} />
              <div className="result-summary">
                <div className="result-summary-label">SHOTTY の診断（要約）</div>
                <div className="result-summary-text">{result.summary}</div>
              </div>
            </div>

            <div className="sw-dx-list">
              {result.diagnosis_items.map((it, i) => (
                <div key={`${it.title}-${i}`} className="sw-dx-item">
                  <div className="sw-dx-head">
                    <span className="sw-dx-no">{i + 1}.</span>
                    <span className="sw-dx-title">{it.title}</span>
                  </div>
                  <div className="sw-dx-detail">{it.detail}</div>
                </div>
              ))}
            </div>

            {/* ポイント詳細タブ */}
            <div className="point-tabs">
              {(['setup', 'swing', 'impact'] as const).map(k => (
                <button
                  key={k}
                  className={`point-tab${activePoint === k ? ' active' : ''}`}
                  onClick={() => setActivePoint(k)}
                >
                  {k === 'setup' ? '① セットアップ' : k === 'swing' ? '② バックスイング' : '③ インパクト'}
                </button>
              ))}
            </div>
            <div className="point-body">{result.points[activePoint]}</div>

            {/* 修正ドリル */}
            <div className="drill-box">
              <div className="drill-label">🔧 修正ドリル（最優先）</div>
              <div className="drill-text">{result.debug_code}</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
