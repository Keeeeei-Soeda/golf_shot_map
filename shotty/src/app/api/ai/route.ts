// 2026-05-21: OpenAI/Gemini 単体からマルチAPI構成に換装
// 旧実装は下部にコメントアウトで残してある（fallback用）
// 新エンドポイント: /api/ai/caddy, /api/ai/club, /api/ai/chat

import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      ok: false,
      error:
        'このエンドポイントは廃止されました。/api/ai/caddy（戦略）・/api/ai/club（クラブ）・/api/ai/chat（雑談）をご利用ください。',
    },
    { status: 410 }
  )
}

/*
// ─── 旧実装（Gemini 単体・全用途共通）────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { resolveGeminiModel, withGeminiRetries } from '@/lib/gemini'

const SYSTEM_INSTRUCTION = `あなたは「Golf System Architect & Debugger」です。...`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    ...
    return NextResponse.json({ ok: true, content })
  } catch (e: unknown) {
    ...
  }
}

*/
