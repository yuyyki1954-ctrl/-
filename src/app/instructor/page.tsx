"use client";

import Link from "next/link";
import { Users, Folder, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
const cohorts = [
    { id: "c1", name: "2024年度 第1期", participants: 12 },
    { id: "c2", name: "2024年度 第2期", participants: 8 },
];

export default function InstructorDashboard() {
    const [participants, setParticipants] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => {
                if (data.users) {
                    setParticipants(data.users);
                }
            })
            .catch((err) => console.error(err));
    }, []);
    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        <h1 className="font-bold text-slate-800 text-lg">講師ダッシュボード</h1>
                    </div>
                    <nav className="flex items-center gap-4">
                        {/* Link removed as per new flow */}
                        <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">
                            ログアウト
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

                {/* Cohort Stats */}
                <section className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center">
                        <span className="text-sm opacity-80 mb-1">全参加者数</span>
                        <span className="text-4xl font-extrabold">{participants.length}</span>
                        <span className="text-xs opacity-70 mt-2">DB連携済み</span>
                    </div>
                </section>

                {/* Participants Table */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <Folder className="w-5 h-5 text-indigo-500" />
                            参加者一覧
                        </h2>
                        <div className="text-sm text-slate-400">
                            最新の提出状況を確認できます
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {participants.map(user => (
                            <div key={user.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{user.name}</div>
                                        <div className="text-xs text-slate-400">ID: {user.id} • {user.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <Link
                                        href={`/app/users/${user.id}`} // Reuse existing detail page
                                        className="flex items-center gap-1 text-sm font-medium text-slate-400 group-hover:text-indigo-600 transition-colors"
                                    >
                                        詳細
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}
