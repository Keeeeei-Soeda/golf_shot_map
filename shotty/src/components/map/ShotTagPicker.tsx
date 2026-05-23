'use client'

import {
  SHOT_TYPES,
  SHOT_FEELS,
  type ShotType,
  type ShotFeel,
} from '@/constants/shotTags'

export interface ShotTagState {
  isOB: boolean
  shotType: ShotType | null
  shotFeel: ShotFeel | null
}

interface Props {
  value: ShotTagState
  onChange: (next: ShotTagState) => void
}

const BASE_BTN: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: 16,
  border: '1px solid var(--g4)',
  background: 'var(--g2)',
  color: 'var(--gr)',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all .15s',
  whiteSpace: 'nowrap',
}

const FEEL_SELECTED_STYLES: Record<string, React.CSSProperties> = {
  good: { background: 'rgba(76,175,80,.25)',  border: '2px solid var(--gv)',  color: 'var(--gv)' },
  mid:  { background: 'rgba(245,158,11,.2)',  border: '2px solid var(--org)', color: 'var(--org)' },
  bad:  { background: 'rgba(224,82,82,.2)',   border: '2px solid var(--red)', color: 'var(--red)' },
}

const TYPE_SELECTED: React.CSSProperties = {
  background: 'rgba(74,159,212,.2)',
  border: '2px solid var(--blue)',
  color: 'var(--blue)',
}

export function ShotTagPicker({ value, onChange }: Props) {
  const { isOB, shotType, shotFeel } = value

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 12px 10px' }}>
      {/* ショット特性 */}
      <div>
        <div style={{ fontSize: 9, color: 'var(--gr)', letterSpacing: 1, marginBottom: 5 }}>特性（状況）</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {(Object.keys(SHOT_TYPES) as ShotType[]).map(key => {
            const selected = shotType === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ isOB, shotType: selected ? null : key, shotFeel })}
                style={selected ? { ...BASE_BTN, ...TYPE_SELECTED } : BASE_BTN}
              >
                {SHOT_TYPES[key].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ショット打感 */}
      <div>
        <div style={{ fontSize: 9, color: 'var(--gr)', letterSpacing: 1, marginBottom: 5 }}>打感（結果）</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {(Object.keys(SHOT_FEELS) as ShotFeel[]).map(key => {
            const info = SHOT_FEELS[key]
            const selected = shotFeel === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ isOB, shotType, shotFeel: selected ? null : key })}
                style={selected ? { ...BASE_BTN, ...FEEL_SELECTED_STYLES[info.kind] } : BASE_BTN}
              >
                {info.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
