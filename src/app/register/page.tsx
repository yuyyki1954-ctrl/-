"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RegisterParticipant() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        cohortId: "c1", // Default cohort
    });
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        console.log("Registered:", formData);
        setIsSuccess(true);
        // Reset form after 3 seconds
        setTimeout(() => {
            setIsSuccess(false);
            setFormData({ name: "", email: "", cohortId: "c1" });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/instructor" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">ダッシュボードへ戻る</span>
                    </Link>
                    <div className="font-bold text-slate-800">参加者登録</div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-lg">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">新規参加者の登録</h1>
                        <p className="text-slate-500 mt-2">参加者の基本情報を入力してください</p>
                    </div>

                    {isSuccess ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <h2 className="text-green-800 font-bold text-lg mb-1">登録完了</h2>
                            <p className="text-green-600">参加者が正常に追加されました。</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    お名前 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="山田 太郎"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    メールアドレス <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="taro.yamada@example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    期 (Cohort) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.cohortId}
                                    onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                                >
                                    <option value="c1">2024年度 第1期</option>
                                    <option value="c2">2024年度 第2期</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg mt-4"
                            >
                                登録する
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
