// 2026-05-21: マルチAPI構成 — 雑談・簡単なQ&A（Gemini 2.5 Flash-Lite）
import { NextRequest, NextResponse } from 'next/server'
import { getGemini, MODELS } from '@/lib/ai/clients'
import { withGeminiRetries } from '@/lib/gemini'
import { apiErrorHint } from '@/lib/ai/errors'

export async function POST(req: NextRequest) {
  try {
    const { question, history } = (await req.json()) as {
      question: string
      history?: Array<{ role: 'user' | 'model'; text: string }>
    }

    if (!question?.trim()) {
      return NextResponse.json({ error: 'question required' }, { status: 400 })
    }

    const model = getGemini().getGenerativeModel({
      model: MODELS.GEMINI_FLASH_LITE,
      systemInstruction:
        'あなたはゴルフ初心者をサポートする親しみやすいAIです。簡潔に日本語で答えてください。ゴルフ以外の話題にも軽く答えてよいですが、ゴルフの質問を優先してください。',
    })

    const chat = model.startChat({
      history:
        history?.map((h) => ({
          role: h.role,
          parts: [{ text: h.text }],
        })) ?? [],
    })

    const result = await withGeminiRetries(() => chat.sendMessage(question))
    const text = result.response.text()

    return NextResponse.json({
      text,
      model: MODELS.GEMINI_FLASH_LITE,
    })
  } catch (error) {
    console.error('[/api/ai/chat] error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: msg + apiErrorHint(msg) },
      { status: 500 }
    )
  }
}
