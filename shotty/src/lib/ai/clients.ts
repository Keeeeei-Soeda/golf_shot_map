import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

export function getAnthropic(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY?.trim()
  if (!key) throw new Error('ANTHROPIC_API_KEY が未設定です')
  return new Anthropic({ apiKey: key })
}

/** Gemini 全用途（club / chat / swing）共通 — GEMINI_API_KEY */
export function getGemini(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key) throw new Error('GEMINI_API_KEY が未設定です')
  return new GoogleGenerativeAI(key)
}

export const MODELS = {
  CLAUDE_SONNET: 'claude-sonnet-4-6',
  GEMINI_PRO: 'gemini-2.5-pro',
  GEMINI_FLASH: 'gemini-2.5-flash',
  GEMINI_FLASH_LITE: 'gemini-2.5-flash-lite',
} as const
