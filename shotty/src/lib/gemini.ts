/**
 * Gemini のモデル名。無料枠・負荷はモデルごとに異なる。
 * 2.x で 503 / high demand / quota になる場合は .env の GEMINI_MODEL を変更。
 * 例: gemini-1.5-flash（安定寄り） / gemini-2.5-flash / gemini-2.5-flash-lite
 */
export const GEMINI_DEFAULT_MODEL = 'gemini-1.5-flash'

export function resolveGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL
}
