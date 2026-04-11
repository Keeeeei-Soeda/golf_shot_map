// ============================================================
// Golf AI Architect - OpenAI プロキシ（Google Apps Script）
// ============================================================
//
// 【デプロイ手順】
// 1. script.google.com で新規プロジェクト作成
// 2. このコードを Code.gs に貼り付け
// 3. 「プロジェクトの設定」→「スクリプトプロパティ」→ 追加
//    プロパティ名: OPENAI_KEY
//    値: sk-proj-... （OpenAIのAPIキー）
// 4. 「デプロイ」→「新しいデプロイ」
//    種類: ウェブアプリ
//    次のユーザーとして実行: 自分
//    アクセスできるユーザー: 全員
// 5. デプロイ後に表示される URL を ai.html の GAS_URL に貼り付け
// ============================================================

const OPENAI_KEY = PropertiesService.getScriptProperties().getProperty('OPENAI_KEY');
const OPENAI_MODEL = 'gpt-4o';
const MAX_TOKENS = 2048;

function doPost(e) {
  try {
    if (!OPENAI_KEY) {
      return jsonRes({ ok: false, error: 'APIキーが未設定です。スクリプトプロパティに OPENAI_KEY を設定してください。' });
    }

    const body = JSON.parse(e.postData.contents);
    const messages = body.messages || [];

    const resp = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_KEY
      },
      payload: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        max_tokens: MAX_TOKENS
      }),
      muteHttpExceptions: true
    });

    const status = resp.getResponseCode();
    const data = JSON.parse(resp.getContentText());

    if (status !== 200) {
      return jsonRes({ ok: false, error: data.error?.message || 'OpenAI APIエラー (HTTP ' + status + ')' });
    }

    const content = data.choices?.[0]?.message?.content || '';
    return jsonRes({ ok: true, content: content });

  } catch(err) {
    return jsonRes({ ok: false, error: err.message });
  }
}

// 動作確認用（ブラウザで URL を開くとこれが表示される）
function doGet(e) {
  return ContentService
    .createTextOutput('⛳ Golf AI Proxy is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function jsonRes(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
