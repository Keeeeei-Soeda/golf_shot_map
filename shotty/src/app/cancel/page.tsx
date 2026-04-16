import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6">
      <div className="text-6xl mb-6">↩️</div>
      <h1 className="text-2xl font-bold mb-3">決済をキャンセルしました</h1>
      <p className="text-gray-400 mb-8 text-center">
        決済は完了していません。<br />
        再度お試しいただく場合はボタンからどうぞ。
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
      >
        ← トップに戻る
      </Link>
    </div>
  );
}
