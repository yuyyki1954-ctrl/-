"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2 } from "lucide-react";

export function FeedbackForm({ userId, role = "participant" }: { userId: string; role?: "participant" | "instructor" }) {
    const [comment, setComment] = useState("");
    const [reflection, setReflection] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load from API on mount
    useEffect(() => {
        if (!userId) return;

        fetch(`/api/feedback?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.feedback && data.feedback.length > 0) {
                    // Get latest feedback
                    const latest = data.feedback[0];
                    // Parse if it was stored as JSON, or just use content
                    try {
                        const parsed = JSON.parse(latest.content);
                        setComment(parsed.comment || "");
                        setReflection(parsed.reflection || "");
                    } catch (e) {
                        // Fallback for simple text
                        setReflection(latest.content);
                    }
                }
            })
            .catch(err => console.error(err));
    }, [userId]);

    const handleSave = async () => {
        setIsLoading(true);
        const content = JSON.stringify({ comment, reflection, updatedAt: new Date().toISOString() });

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, content }),
            });

            if (res.ok) {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            } else {
                alert("保存に失敗しました");
            }
        } catch (error) {
            alert("通信エラーが発生しました");
        }
        setIsLoading(false);
    };

    const isParticipant = role === "participant";

    return (
        <div className="space-y-8">
            {/* Reflection Area (Participant) */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                    本日の振り返り
                </h3>
                <textarea
                    readOnly={!isParticipant}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder={isParticipant ? "講習の気づきや疑問点を入力してください..." : "参加者の振り返りがここに表示されます"}
                    className={`w-full h-32 p-4 rounded-xl border border-slate-200 transition-all resize-none text-slate-700 placeholder:text-slate-300 ${!isParticipant ? "bg-slate-50 cursor-not-allowed focus:outline-none" : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
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
                    readOnly={isParticipant}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={!isParticipant ? "参加者へのコメントを入力してください" : "講師からのコメントがここに表示されます"}
                    className={`w-full h-32 p-4 rounded-xl border border-slate-200 transition-all resize-none text-slate-700 placeholder:text-slate-400 relative z-10 ${isParticipant ? "bg-slate-50 cursor-not-allowed focus:outline-none" : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"}`}
                />
            </section>

            {/* Action Bar */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-md transition-all ${isSaved
                        ? "bg-green-500 text-white shadow-green-200"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:-translate-y-0.5"
                        } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
                >
                    {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isSaved ? "保存しました" : isLoading ? "保存中..." : "保存する"}
                </button>
            </div>
        </div>
    );
}
