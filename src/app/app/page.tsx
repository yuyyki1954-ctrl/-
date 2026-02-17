import Link from "next/link";
import { Users, ChevronRight, Folder } from "lucide-react";

// Dummy Data
const cohorts = [
    { id: "c1", name: "2024年度 第1期", participants: 12 },
    { id: "c2", name: "2024年度 第2期", participants: 8 },
];

const participants = [
    { id: "u1", name: "山田 太郎", cohortId: "c1", progress: 80 },
    { id: "u2", name: "鈴木 花子", cohortId: "c1", progress: 45 },
    { id: "u3", name: "佐藤 次郎", cohortId: "c1", progress: 100 },
    { id: "u4", name: "田中 美咲", cohortId: "c2", progress: 20 },
];

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <Folder className="text-blue-600" />
                            ダッシュボード
                        </h1>
                        <p className="text-slate-500 mt-2">講習会の期と参加者を選択してください</p>
                    </div>
                    <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 underline">
                        トップに戻る
                    </Link>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Cohort Selection (Sidebar-ish) */}
                    <div className="md:col-span-1 space-y-6">
                        <section>
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                期 (Items)
                            </h2>
                            <div className="space-y-3">
                                {cohorts.map((cohort) => (
                                    <div
                                        key={cohort.id}
                                        className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-slate-700 group-hover:text-blue-700">
                                                {cohort.name}
                                            </span>
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">
                                                {cohort.participants}名
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Participant List */}
                    <div className="md:col-span-2">
                        <section>
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                参加者一覧
                            </h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                {participants.map((user) => (
                                    <Link
                                        key={user.id}
                                        href={`/app/users/${user.id}`}
                                        className="block hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                    >
                                        <div className="p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{user.name}</div>
                                                    <div className="text-xs text-slate-400">ID: {user.id}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs font-medium text-slate-500">進捗率</span>
                                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${user.progress === 100
                                                                    ? "bg-green-500"
                                                                    : user.progress > 50
                                                                        ? "bg-blue-500"
                                                                        : "bg-orange-400"
                                                                }`}
                                                            style={{ width: `${user.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
