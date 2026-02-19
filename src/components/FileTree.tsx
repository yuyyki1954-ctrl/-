"use client";

import { useState, useCallback, useEffect } from "react";
import { Folder, File, UploadCloud, ChevronRight, ChevronDown, Trash2 } from "lucide-react";

type FileNode = {
    id: string;
    name: string;
    type: "file" | "folder";
    size?: number;
    children?: FileNode[];
};

export function FileTree({ userId }: { userId: string }) {
    const [files, setFiles] = useState<FileNode[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchFiles = useCallback(async () => {
        try {
            const res = await fetch(`/api/files?userId=${userId}`);
            const data = await res.json();
            if (data.files) {
                // Map API response to FileNode structure
                // For this prototype, we'll just show a flat list of files
                const fileNodes: FileNode[] = data.files.map((f: any) => ({
                    id: f.id.toString(),
                    name: f.filename,
                    type: "file",
                    size: f.size
                }));
                setFiles(fileNodes);
            }
        } catch (error) {
            console.error("Failed to fetch files:", error);
        }
    }, [userId]);

    // Initial fetch
    useEffect(() => {
        if (userId) fetchFiles();
    }, [userId, fetchFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setIsLoading(true);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length === 0) return;

        // Upload each file
        for (const file of droppedFiles) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("userId", userId);

            try {
                const res = await fetch("/api/files", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) {
                    const err = await res.json();
                    alert(`アップロード失敗 (${file.name}): ${err.error}`);
                }
            } catch (error) {
                console.error(error);
                alert(`アップロードエラー (${file.name})`);
            }
        }

        setIsLoading(false);
        fetchFiles(); // Refresh list
    }, [userId, fetchFiles]);

    const handleDelete = async (fileId: string) => {
        if (!confirm("ファイルを削除しますか？")) return;

        try {
            const res = await fetch("/api/files", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId, userId }),
            });

            if (res.ok) {
                fetchFiles();
            } else {
                alert("削除に失敗しました");
            }
        } catch (error) {
            alert("削除エラー");
        }
    };

    const handleDownload = (fileId: string) => {
        // Open in new tab to trigger download
        window.open(`/api/files/${fileId}`, "_blank");
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-500" />
                    フォルダ管理
                </h3>
                <span className="text-xs text-slate-400">
                    {isLoading ? "処理中..." : "Only files < 1MB"}
                </span>
            </div>

            {/* Drop Zone / Tree Area */}
            <div
                className={`flex-grow p-6 transition-colors ${isDragging ? "bg-blue-50 border-blue-300" : "bg-white"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-8">
                        <UploadCloud className="w-12 h-12 mb-3 text-slate-300" />
                        <p>ここにファイルをドロップ</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {files.map((node) => (
                            <div
                                key={node.id}
                                className="flex items-center gap-2 py-2 px-2 hover:bg-slate-50 rounded-md cursor-pointer text-sm text-slate-700 select-none group"
                            >
                                <File className="w-4 h-4 text-slate-400" />
                                <span className="flex-grow" onClick={() => handleDownload(node.id)}>
                                    {node.name}
                                </span>
                                <span className="text-xs text-slate-300">
                                    {node.size ? `${(node.size / 1024).toFixed(1)} KB` : ""}
                                </span>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(node.id)}
                                        className="p-1 hover:text-red-500 text-slate-300"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isDragging && (
                    <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none">
                        <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center animate-bounce">
                            <UploadCloud className="w-12 h-12 text-blue-600 mb-2" />
                            <p className="font-bold text-blue-700">ファイルをアップロード</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
