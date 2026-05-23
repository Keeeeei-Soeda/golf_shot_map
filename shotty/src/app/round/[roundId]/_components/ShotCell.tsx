import {
  SHOT_TYPES,
  SHOT_FEELS,
  FEEL_BADGE_CLASSES,
  TYPE_BADGE_CLASS,
  OB_BADGE_CLASS,
  type ShotType,
  type ShotFeel,
} from '@/constants/shotTags'

interface ShotCellProps {
  club?: string | null
  carry?: number | null
  isOB?: boolean
  shotType?: ShotType | null
  shotFeel?: ShotFeel | null
}

export function ShotCell({ club, carry, isOB, shotType, shotFeel }: ShotCellProps) {
  const isEmpty = !club && carry == null && !isOB && !shotType && !shotFeel
  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-300 text-sm">
        —
      </div>
    )
  }

  const typeInfo = shotType ? SHOT_TYPES[shotType] : null
  const feelInfo = shotFeel ? SHOT_FEELS[shotFeel] : null

  return (
    <div className="flex flex-col items-center justify-center h-full py-1 leading-tight gap-0.5">
      {club && (
        <span className="text-[11px] font-medium text-[#185FA5]">{club}</span>
      )}
      {isOB ? (
        <span className={`text-[9px] px-1.5 py-px rounded-full leading-tight ${OB_BADGE_CLASS}`}>
          OB
        </span>
      ) : carry != null && carry > 0 ? (
        <span className="text-[10px] tabular-nums">{Math.round(carry)}y</span>
      ) : null}
      {typeInfo && (
        <span
          className={`text-[9px] px-1.5 py-px rounded-full leading-tight whitespace-nowrap ${TYPE_BADGE_CLASS}`}
        >
          {typeInfo.label}
        </span>
      )}
      {feelInfo && (
        <span
          className={`text-[9px] px-1.5 py-px rounded-full leading-tight whitespace-nowrap ${FEEL_BADGE_CLASSES[feelInfo.kind]}`}
        >
          {feelInfo.label}
        </span>
      )}
    </div>
  )
}
