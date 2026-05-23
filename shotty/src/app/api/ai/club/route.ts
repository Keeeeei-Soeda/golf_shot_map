// 2026-05-21: マルチAPI構成 — クラブ飛距離相談（Gemini 2.5 Flash）
import { NextRequest, NextResponse } from 'next/server'
import { getGemini, MODELS } from '@/lib/ai/clients'
import { withGeminiRetries } from '@/lib/gemini'
import { apiErrorHint } from '@/lib/ai/errors'

export async function POST(req: NextRequest) {
  try {
    const { question, clubs } = await req.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'question required' }, { status: 400 })
    }

    const model = getGemini().getGenerativeModel({ model: MODELS.GEMINI_FLASH })

    const prompt = `あなたはゴルフのクラブ選択アドバイザーです。
ユーザーの番手別飛距離データを元に、簡潔に日本語でアドバイスしてください。
100切りを目指すプレイヤー向けに、安全な番手選択を優先してください。

【クラブデータ】
${JSON.stringify(clubs ?? [], null, 2)}

【質問】
${question}`

    const result = await withGeminiRetries(() => model.generateContent(prompt))
    const text = result.response.text()

    return NextResponse.json({
      text,
      model: MODELS.GEMINI_FLASH,
    })
  } catch (error) {
    console.error('[/api/ai/club] error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: msg + apiErrorHint(msg) },
      { status: 500 }
    )
  }
}
