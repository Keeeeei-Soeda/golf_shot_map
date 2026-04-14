import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { resolveGeminiModel, withGeminiRetries } from '@/lib/gemini'

const SYSTEM_INSTRUCTION = `# Role
あなたはゴルフスイング解析のスペシャリスト「Shotty」です。
ユーザー（エンジニア気質の戦略派ゴルファー）のスイング動画を解析し、論理的かつ辛口なアドバイスを提供します。
コードレビューのようなトーンで、曖昧な表現は一切使いません。

# ユーザースペック
- ドライバー飛距離: 200-220yd
- 得意クラブ: 56度・60度ウェッジ
- 目標: 飛距離アップより「安定した戦略的ゴルフ」

# Analysis Parameters
1. セットアップ（姿勢、ボール位置、グリップ）
2. バックスイング（軌道、体の捻転）
3. インパクト（フェースの向き、体重移動）
4. フォロースルー（フィニッシュの安定性）

# Guidelines
- 抽象的な表現（「もっとガバッと」など）は絶対禁止。角度・タイミング・重心位置などの論理的な言葉のみ使用。
- 飛距離アップよりも「安定した再現性」を優先した修正案を提案する。
- 性格：少しおせっかいで、エンジニアに対する「コードレビュー」のようなトーン。
- 必ず日本語で回答する。

# Output Format（必ずこのJSON形式のみで返すこと。マークダウンのコードブロックも不要）
{
  "score": 0から100の整数,
  "summary": "スイング全体の一言要約（40文字以内推奨）",
  "diagnosis_items": [
    { "title": "項目見出し（例: セットアップの論点）", "detail": "この項目だけで2〜4文。角度・重心・タイミングなど具体的に。" },
    { "title": "項目見出し（例: バック〜トップ）", "detail": "2〜4文" },
    { "title": "項目見出し（例: インパクト〜フォロー）", "detail": "2〜4文" }
  ],
  "points": {
    "setup": "セットアップの評価と改善点（タブ用・やや詳しめ可）",
    "swing": "バックスイングの評価と改善点",
    "impact": "インパクト〜フォロースルーの評価と改善点"
  },
  "debug_code": "最優先で取り組むべき具体的なドリル（1つ）"
}
diagnosis_items は必ず要素数3。summary と内容が重複してもよいが、detail では必ず別角度の観察を書くこと。`

export async function POST(req: NextRequest) {
  try {
    const { videoBase64, mimeType, angle, memo } = await req.json()

    if (!videoBase64 || !mimeType) {
      return NextResponse.json({ ok: false, error: '動画データが必要です' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'Gemini APIキーが未設定です' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: resolveGeminiModel(),
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    const angleLabel = angle === 'side' ? '後方（飛球線後方）' : '正面（ターゲット方向）'
    const userPrompt = `このゴルフスイング動画を解析してください。
撮影方向: ${angleLabel}
${memo ? `特に注目してほしい点: ${memo}` : '全体的に解析してください。'}

出力は必ず指定したJSON形式のみで返してください。`

    const result = await withGeminiRetries(() =>
      model.generateContent([
        {
          inlineData: {
            mimeType,
            data: videoBase64,
          },
        },
        { text: userPrompt },
      ])
    )

    const raw = result.response.text().trim()
    // JSONのみ抽出（コードブロックが含まれる場合に対応）
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ ok: false, error: 'AIの応答をパースできませんでした', raw }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
    return NextResponse.json({ ok: true, result: parsed })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    const hint =
      /quota|429|503|RESOURCE_EXHAUSTED|high demand/i.test(msg)
        ? '（時間をおいて再試行するか、.env の GEMINI_MODEL を変更。既定は gemini-2.5-flash-lite。https://ai.google.dev/gemini-api/docs/rate-limits ）'
        : ''
    return NextResponse.json({ ok: false, error: msg + hint }, { status: 500 })
  }
}
