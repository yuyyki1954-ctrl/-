import Link from "next/link";
import { ChevronLeft, User, Calendar } from "lucide-react";
import { FileTree } from "@/components/FileTree";
import { FeedbackForm } from "@/components/FeedbackForm";

// Dummy Data Lookup (In real app, fetch from DB)
const users: Record<string, { name: string; cohort: string; email: string }> = {
    "u1": { name: "山田 太郎", cohort: "2024年度 第1期", email: "taro.yamada@example.com" },
    "u2": { name: "鈴木 花子", cohort: "2024年度 第1期", email: "hanako.suzuki@example.com" },
    "u3": { name: "佐藤 次郎", cohort: "2024年度 第1期", email: "jiro.sato@example.com" },
    "u4": { name: "田中 美咲", cohort: "2024年度 第2期", email: "misaki.tanaka@example.com" },
};

export function generateStaticParams() {
    return Object.keys(users).map((id) => ({ id }));
}

// Params type definition for page component
type Props = {
    params: Promise<{ id: string }>;
};

export default async function UserDetailPage({ params }: Props) {
    const { id } = await params;
    const user = users[id] || { name: "Unknown User", cohort: "-", email: "-" };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header / Nav */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
                    <Link
                        href="/app"
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-slate-800 text-lg leading-tight">{user.name}</h1>
                        <span className="text-xs text-slate-500">{user.cohort}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-3 text-sm text-slate-500">
                        <div className="hidden md:flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>2026/02/17</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* User Sidebar (3 col) */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                                {user.name.charAt(0)}
                            </div>
                            <h2 className="font-bold text-lg text-slate-800">{user.name}</h2>
                            <p className="text-slate-400 text-sm mt-1">{user.email}</p>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between text-sm">
                                <span className="text-slate-500">提出率</span>
                                <span className="font-bold text-blue-600">80%</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-3 opacity-90">
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">参加者ステータス</span>
                            </div>
                            <div className="text-2xl font-bold">受講中</div>
                            <div className="mt-4 text-xs opacity-75">
                                最終アクセス: 2時間前
                            </div>
                        </div>
                    </aside>

                    {/* Main Content (9 col) */}
                    <div className="lg:col-span-9 space-y-8">

                        {/* File Management Section */}
                        <section className="h-[500px]">
                            <FileTree />
                        </section>

                        {/* Feedback Section */}
                        <FeedbackForm userId={id} />

                    </div>
                </div>
            </main>
        </div>
    );
}
