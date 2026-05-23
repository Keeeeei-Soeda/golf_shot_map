'use client'

import {
  SHOT_TYPES,
  SHOT_FEELS,
  FEEL_BADGE_CLASSES,
  TYPE_BADGE_CLASS,
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

export function ShotTagPicker({ value, onChange }: Props) {
  const { isOB, shotType, shotFeel } = value

  return (
    <div className="flex flex-col gap-2.5 px-3 pb-3 pt-1">
      {/* ショット特性 */}
      <div>
        <div className="text-[10px] text-zinc-500 mb-1">特性（状況）</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SHOT_TYPES) as ShotType[]).map(key => {
            const selected = shotType === key
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  onChange({ isOB, shotType: selected ? null : key, shotFeel })
                }
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  selected
                    ? TYPE_BADGE_CLASS
                    : 'bg-white border border-zinc-300 text-zinc-500'
                }`}
              >
                {SHOT_TYPES[key].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ショット打感 */}
      <div>
        <div className="text-[10px] text-zinc-500 mb-1">打感（結果）</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SHOT_FEELS) as ShotFeel[]).map(key => {
            const info = SHOT_FEELS[key]
            const selected = shotFeel === key
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  onChange({ isOB, shotType, shotFeel: selected ? null : key })
                }
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  selected
                    ? FEEL_BADGE_CLASSES[info.kind]
                    : 'bg-white border border-zinc-300 text-zinc-500'
                }`}
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
