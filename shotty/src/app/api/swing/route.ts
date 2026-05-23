// 2026-05-21: マルチAPI構成に換装 — 新エンドポイント: /api/ai/swing
// 旧実装は下部にコメントアウトで残してある（fallback用）

import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      ok: false,
      error: 'このエンドポイントは廃止されました。/api/ai/swing をご利用ください。',
    },
    { status: 410 }
  )
}

/*
// ─── 旧実装（Gemini Flash-Lite 等・resolveGeminiModel）────────────────

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { resolveGeminiModel, withGeminiRetries } from '@/lib/gemini'
...
export async function POST(req: NextRequest) { ... }

*/
