'use client'

import { useEffect, useState } from 'react'
import {
  clearHoleShots,
  onGpsBtn,
  openClubEditor,
  openHistory,
  openScorecard,
  toggleReview,
} from '@/app/golf/logic'
import { LAUNCHER_GROUPS, type LauncherActionId } from '@/lib/launcher-items'

/**
 * Googleアプリ風の9ドットランチャー。
 * ラウンド中の低頻度機能入口のみ。ロジックは既存関数を呼ぶだけ。
 */
export default function FeatureLauncher() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const run = (id: LauncherActionId) => {
    setOpen(false)
    switch (id) {
      case 'scorecard':
        openScorecard()
        break
      case 'history':
        openHistory()
        break
      case 'gps':
        onGpsBtn()
        break
      case 'clubs':
        openClubEditor()
        break
      case 'shots':
        toggleReview()
        break
      case 'clearHole':
        if (!confirm('このホールの記録を消去しますか？')) return
        clearHoleShots()
        break
    }
  }

  return (
    <div className="feature-launcher">
      {/* logic.ts が参照する常設ノード（パネル開閉で消えない） */}
      <button type="button" id="gpsBtn" className="launcher-gps-proxy" tabIndex={-1} aria-hidden />
      <span id="histBadge" className="hist-badge launcher-hist-badge" style={{ display: 'none' }} />

      <button
        type="button"
        className={`hdr-btn launcher-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="機能メニュー"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="機能メニュー"
      >
        <span className="launcher-dots" aria-hidden>
          <i /><i /><i /><i /><i /><i /><i /><i /><i />
        </span>
      </button>

      {open && (
        <>
          <div
            className="launcher-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="launcher-panel"
            role="dialog"
            aria-label="ラウンド機能"
          >
            {LAUNCHER_GROUPS.map(group => (
              <div key={group.id} className="launcher-group">
                {group.separatorBefore && (
                  <hr className="launcher-separator" aria-hidden />
                )}
                {group.label && (
                  <div className="launcher-group-label">{group.label}</div>
                )}
                <div className="launcher-grid">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className={`launcher-tile${item.destructive ? ' is-danger' : ''}`}
                      onClick={() => run(item.id)}
                      aria-label={item.ariaLabel}
                    >
                      <span className="launcher-tile-icon" aria-hidden>
                        {item.iconSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.iconSrc} alt="" width={28} height={28} />
                        ) : (
                          item.icon
                        )}
                      </span>
                      <span className="launcher-tile-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
