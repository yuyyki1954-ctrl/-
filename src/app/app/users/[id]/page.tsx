"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, User, Calendar } from "lucide-react";
import { FileTree } from "@/components/FileTree";
import { FeedbackForm } from "@/components/FeedbackForm";

// Params type definition for page component
type Props = {
    params: Promise<{ id: string }>;
};

export default function UserDetailPage({ params }: Props) {
    const [userId, setUserId] = useState<string>("");
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        // Unwrap params Promise
        params.then((p) => {
            setUserId(p.id);
            // Fetch user details
            fetch(`/api/users/${p.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.user) setUser(data.user);
                })
                .catch(err => console.error(err));
        });
    }, [params]);

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header / Nav */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
                    <Link
                        href="/instructor"
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-slate-800 text-lg leading-tight">{user.name}</h1>
                        <span className="text-xs text-slate-500">参加者詳細</span>
                    </div>
                    <div className="ml-auto flex items-center gap-3 text-sm text-slate-500">
                        <div className="hidden md:flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date().toLocaleDateString()}</span>
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
                            <p className="text-slate-300 text-xs mt-1">ID: {userId}</p>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between text-sm">
                                <span className="text-slate-500">ステータス</span>
                                <span className="font-bold text-blue-600">Active</span>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content (9 col) */}
                    <div className="lg:col-span-9 space-y-8">

                        {/* File Management Section */}
                        <section className="h-[500px]">
                            <FileTree userId={userId} />
                        </section>

                        {/* Feedback Section */}
                        <FeedbackForm userId={userId} role="instructor" />

                    </div>
                </div>
            </main>
        </div>
    );
}
