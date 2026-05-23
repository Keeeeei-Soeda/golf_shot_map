export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1f0d] text-white p-6">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-xl font-bold mb-3">メールを送信しました</h1>
        <p className="text-sm text-gray-400 mb-6">
          ご登録のメールアドレスに、サインインリンクをお送りしました。
          メールを開いてリンクをクリックしてください。
        </p>
        <p className="text-xs text-gray-500">
          メールが届かない場合は迷惑メールフォルダもご確認ください。
        </p>
      </div>
    </div>
  )
}
