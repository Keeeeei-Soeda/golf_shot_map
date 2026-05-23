const KEY_DISMISSED_9H = 'shotty_prompt_dismissed_9h'
const KEY_DISMISSED_18H = 'shotty_prompt_dismissed_18h'
const KEY_DISMISSED_GLOBAL = 'shotty_prompt_dismissed_global'

export function dismiss9h(roundId: string) {
  const stored = JSON.parse(localStorage.getItem(KEY_DISMISSED_9H) ?? '{}')
  stored[roundId] = true
  localStorage.setItem(KEY_DISMISSED_9H, JSON.stringify(stored))
}

export function isDismissed9h(roundId: string): boolean {
  if (isDismissedGlobal()) return true
  const stored = JSON.parse(localStorage.getItem(KEY_DISMISSED_9H) ?? '{}')
  return !!stored[roundId]
}

export function dismiss18h(roundId: string) {
  const stored = JSON.parse(localStorage.getItem(KEY_DISMISSED_18H) ?? '{}')
  stored[roundId] = true
  localStorage.setItem(KEY_DISMISSED_18H, JSON.stringify(stored))
}

export function isDismissed18h(roundId: string): boolean {
  if (isDismissedGlobal()) return true
  const stored = JSON.parse(localStorage.getItem(KEY_DISMISSED_18H) ?? '{}')
  return !!stored[roundId]
}

/** 「今後は促さない」設定 */
export function dismissGlobal() {
  localStorage.setItem(KEY_DISMISSED_GLOBAL, 'true')
}

export function isDismissedGlobal(): boolean {
  return localStorage.getItem(KEY_DISMISSED_GLOBAL) === 'true'
}

/**
 * ラウンドオブジェクトから完了ホール数をカウント。
 * shots は `{ "0_0_0": [...], "0_0_0_meta": { cupIn, ... } }` 形式。
 */
export function countCompletedHoles(round: { shots: Record<string, unknown> }): number {
  let count = 0
  for (const key of Object.keys(round.shots)) {
    if (key.endsWith('_meta')) {
      const meta = round.shots[key] as { cupIn?: boolean } | null
      if (meta?.cupIn) count++
    }
  }
  return count
}
