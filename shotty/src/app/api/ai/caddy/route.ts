// 2026-05-21: マルチAPI構成 — コース戦略・スコア分析（Claude Sonnet 4.6）
import { NextRequest, NextResponse } from 'next/server'
import { getAnthropic, MODELS } from '@/lib/ai/clients'
import type { CaddyContext } from '@/lib/ai/types'
import { apiErrorHint } from '@/lib/ai/errors'

const SYSTEM_PROMPT = `あなたは「The Strategic Architect」というキャディAIです。
100切りを目指すゴルファーに対して、リスク回避と期待値重視で淡々とアドバイスします。
- 冷静沈着: 感情的な励ましより論理的なデータを示す
- リスク回避: OB・池・バンカー・3パットを徹底的に避ける
- 期待値重視: 成功率の高い安全な番手を推奨
- 「ボギーはパー」理論: 無理なパーオン狙いを制止する
- 「一か八か」「気合で」は禁止
- ゴルフ以外の話題には「申し訳ありませんが、私はゴルフ専用AIです。」とだけ答える
日本語で回答し、論理的かつ具体的な戦略を提示してください。`

export async function POST(req: NextRequest) {
  try {
    const { question, context } = (await req.json()) as {
      question: string
      context?: CaddyContext
    }

    if (!question?.trim()) {
      return NextResponse.json({ error: 'question required' }, { status: 400 })
    }

    const anthropic = getAnthropic()
    const userMessage = `【ラウンド履歴】
${JSON.stringify(context?.rounds ?? [], null, 2)}

【クラブセット】
${JSON.stringify(context?.clubs ?? [], null, 2)}

【現在のホール】
${JSON.stringify(context?.currentHole ?? null, null, 2)}

【質問】
${question}`

    const response = await anthropic.messages.create({
      model: MODELS.CLAUDE_SONNET,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n')

    return NextResponse.json({
      text,
      model: MODELS.CLAUDE_SONNET,
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    })
  } catch (error) {
    console.error('[/api/ai/caddy] error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: msg + apiErrorHint(msg) },
      { status: 500 }
    )
  }
}
