"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2 } from "lucide-react";

export function FeedbackForm({ userId }: { userId: string }) {
    const [comment, setComment] = useState("");
    const [reflection, setReflection] = useState("");
    const [isSaved, setIsSaved] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(`feedback_${userId}`);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setComment(parsed.comment || "");
            setReflection(parsed.reflection || "");
        }
    }, [userId]);

    const handleSave = () => {
        localStorage.setItem(
            `feedback_${userId}`,
            JSON.stringify({ comment, reflection, updatedAt: new Date().toISOString() })
        );
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-8">
            {/* Reflection Area (Participant) */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                    本日の振り返り
                </h3>
                <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="講習の気づきや疑問点を入力してください..."
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-slate-700 placeholder:text-slate-300"
                />
            </section>

            {/* Comment Area (Instructor) */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-10 -mt-10"></div>
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2 relative z-10">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    講師からのコメント
                </h3>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="講師のみ入力可能です（デモでは入力可）"
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-slate-700 placeholder:text-slate-400 relative z-10"
                />
            </section>

            {/* Action Bar */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-md transition-all ${isSaved
                            ? "bg-green-500 text-white shadow-green-200"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:-translate-y-0.5"
                        }`}
                >
                    {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isSaved ? "保存しました" : "保存する"}
                </button>
            </div>
        </div>
    );
}
