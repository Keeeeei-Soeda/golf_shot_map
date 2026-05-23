// 2026-05-21: マルチAPI構成 — スイング動画解析（Gemini 2.5 Pro）
import { NextRequest, NextResponse } from 'next/server'
import { getGemini, MODELS } from '@/lib/ai/clients'
import { withGeminiRetries } from '@/lib/gemini'
import { apiErrorHint } from '@/lib/ai/errors'

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
    { "title": "項目見出し", "detail": "2〜4文" },
    { "title": "項目見出し", "detail": "2〜4文" },
    { "title": "項目見出し", "detail": "2〜4文" }
  ],
  "points": {
    "setup": "セットアップの評価と改善点",
    "swing": "バックスイングの評価と改善点",
    "impact": "インパクト〜フォロースルーの評価と改善点"
  },
  "debug_code": "最優先で取り組むべき具体的なドリル（1つ）"
}
diagnosis_items は必ず要素数3。`

async function readVideoFromRequest(req: NextRequest): Promise<{
  base64: string
  mimeType: string
  angle?: string
  memo?: string
} | null> {
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const videoFile = formData.get('video') as File | null
    const note = (formData.get('note') as string | null) ?? ''
    if (!videoFile) return null
    const buffer = await videoFile.arrayBuffer()
    return {
      base64: Buffer.from(buffer).toString('base64'),
      mimeType: videoFile.type || 'video/mp4',
      memo: note,
    }
  }

  const body = await req.json()
  if (!body.videoBase64 || !body.mimeType) return null
  return {
    base64: body.videoBase64 as string,
    mimeType: body.mimeType as string,
    angle: body.angle as string | undefined,
    memo: body.memo as string | undefined,
  }
}

export async function POST(req: NextRequest) {
  try {
    const video = await readVideoFromRequest(req)
    if (!video) {
      return NextResponse.json({ ok: false, error: '動画データが必要です' }, { status: 400 })
    }

    const angleLabel =
      video.angle === 'side' ? '後方（飛球線後方）' : video.angle === 'front' ? '正面（ターゲット方向）' : '指定なし'

    const model = getGemini().getGenerativeModel({
      model: MODELS.GEMINI_PRO,
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    const userPrompt = `このゴルフスイング動画を解析してください。
撮影方向: ${angleLabel}
${video.memo ? `特に注目してほしい点: ${video.memo}` : '全体的に解析してください。'}

出力は必ず指定したJSON形式のみで返してください。`

    const result = await withGeminiRetries(() =>
      model.generateContent([
        { inlineData: { mimeType: video.mimeType, data: video.base64 } },
        { text: userPrompt },
      ])
    )

    const raw = result.response.text().trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { ok: false, error: 'AIの応答をパースできませんでした', raw, model: MODELS.GEMINI_PRO },
        { status: 500 }
      )
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
    return NextResponse.json({
      ok: true,
      result: parsed,
      model: MODELS.GEMINI_PRO,
    })
  } catch (error) {
    console.error('[/api/ai/swing] error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { ok: false, error: msg + apiErrorHint(msg) },
      { status: 500 }
    )
  }
}
