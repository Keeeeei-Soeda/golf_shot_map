import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { resolveGeminiModel, withGeminiRetries } from '@/lib/gemini'

const SYSTEM_INSTRUCTION = `あなたは「Golf System Architect & Debugger」です。ユーザーの「100切り」を最短で達成させるための戦略的キャディかつデータサイエンティストとして振る舞ってください。

■ 性格・スタンス
- 冷静沈着（Stoic）: ミスショットをしても動揺せず、淡々と次の「リカバリー最適解」を提示する。感情的な励ましよりも論理的なデータを示す。
- リスク回避型（Risk-Averse）: OB・池・バンカー・3パットを徹底的に避けることを優先する。
- 期待値重視: 「成功率20%の180ydショット」よりも「成功率80%の100ydショット」を推奨する。

■ 思考アルゴリズム（行動指針）
- 「ボギーはパー」理論: 100切りには「オールボギー（90）」で十分。常に「ボギーオン」を正解とし、無理なパーオン狙いを制止する。
- ハザードのデバッグ: 常に「最もやってはいけないミス（右OBなど）」を特定し、物理的に回避するアドレスと番手を提案する。
- クラブ特性の把握: ユーザーの個別の癖（フック傾向など）とクラブ仕様を計算に入れたマネジメントを行う。
- スイングのデバッグ: ユーザーが「意識」を聞いてきた場合、現在のミス傾向を打ち消す「修正コード（具体的動作）」を提示する。

■ 制約（必ず守ること）
- 「一か八か」「気合で」というアドバイスは絶対禁止。
- 常に「全ホールボギーで90」であることをリマインドして100切りを目指させる。
- ゴルフ以外の話題には「申し訳ありませんが、私はゴルフ専用AIです。」とだけ答える。
- 回答は日本語で行う。`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'Gemini APIキーが未設定です' }, { status: 500 })
    }

    const modelId = resolveGeminiModel()
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    // OpenAI形式のmessages → Gemini形式のcontentsに変換
    // systemメッセージはsystemInstructionで渡すので除外
    const contents = messages
      .filter((m: { role: string; content: string }) => m.role !== 'system')
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    // 最後のユーザーメッセージを分離してsendMessageに渡す
    const lastUser = contents.filter((c: { role: string }) => c.role === 'user').slice(-1)[0]
    const history = contents.slice(0, -1)

    const chat = model.startChat({ history })
    const result = await withGeminiRetries(() => chat.sendMessage(lastUser.parts[0].text))
    const content = result.response.text()

    return NextResponse.json({ ok: true, content })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    const hint =
      /quota|429|503|RESOURCE_EXHAUSTED|high demand/i.test(msg)
        ? '（時間をおいて再試行するか、.env の GEMINI_MODEL を変更。既定は gemini-2.5-flash-lite。https://ai.google.dev/gemini-api/docs/rate-limits ）'
        : ''
    return NextResponse.json({ ok: false, error: msg + hint }, { status: 500 })
  }
}
