"use client";

import { useState } from "react";
import { Folder, LogIn, User } from "lucide-react";
import { FileTree } from "@/components/FileTree";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function ParticipantDashboard() {
  const [userId, setUserId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId }),
        });

        if (res.ok) {
          const data = await res.json();
          // In a real app, you would set a session/cookie here
          setIsLoggedIn(true);
          setError("");
        } else {
          setError("IDが見つかりません");
        }
      } catch (error) {
        setError("通信エラーが発生しました");
      }
    } else {
      setError("参加者IDを入力してください");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">講習会フォルダ</h1>
            <p className="text-slate-500 mt-2">参加者IDを入力してログイン</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-slate-700 mb-1">
                参加者ID
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="例: user123"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              ログイン
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            <a href="/register" className="text-blue-600 font-medium hover:underline">
              はじめての方はこちら（新規登録）
            </a>
            <a href="/instructor" className="text-slate-400 hover:text-blue-600 transition-colors">
              管理者(講師)はこちら
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-6 h-6 text-blue-600" />
            <h1 className="font-bold text-slate-800 text-lg">マイフォルダ</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{userId}</span>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Info Card */}
        <section className="bg-blue-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">ようこそ、{userId} さん</h2>
            <p className="opacity-90 text-sm">
              ここに講習資料や提出物をアップロードしてください。<br />
              講師からのコメントもここで確認できます。
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Folder className="w-40 h-40 -mr-8 -mb-8" />
          </div>
        </section>

        {/* File Management */}
        <section className="h-[500px]">
          <FileTree />
        </section>

        {/* Feedback */}
        <div className="border-t border-slate-200 pt-8">
          <FeedbackForm userId={userId} />
        </div>
      </main>
    </div>
  );
}
