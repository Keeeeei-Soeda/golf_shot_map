/**
 * Gemini のモデル名（generateContent 用の現行 ID）。
 * gemini-2.5-flash は高負荷で 503 が出やすいため、既定は lite（混雑時に有利）。
 * 品質優先なら .env で GEMINI_MODEL=gemini-2.5-flash
 */
export const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash-lite'

export function resolveGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL
}

/** 503 / 429 など一時的エラー時に再試行（指数に近い待機） */
export async function withGeminiRetries<T>(fn: () => Promise<T>, options?: { maxAttempts?: number; baseDelayMs?: number }): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 4
  const baseDelayMs = options?.baseDelayMs ?? 2500
  let lastErr: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (e: unknown) {
      lastErr = e
      const msg = String((e as { message?: string })?.message ?? e)
      const retryable = /503|429|RESOURCE_EXHAUSTED|high demand|overloaded|temporarily unavailable|UNAVAILABLE/i.test(msg)
      if (!retryable || attempt === maxAttempts) throw e
      const delay = baseDelayMs * attempt
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastErr
}
