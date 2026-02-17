"use client";

import { useState, useCallback } from "react";
import { Folder, File, UploadCloud, ChevronRight, ChevronDown, Trash2 } from "lucide-react";

type FileNode = {
    id: string;
    name: string;
    type: "file" | "folder";
    children?: FileNode[];
};

const initialFiles: FileNode[] = [
    {
        id: "root-1",
        name: "課題01_提出物",
        type: "folder",
        children: [
            { id: "f1", name: "report_v1.pdf", type: "file" },
            { id: "f2", name: "reference.docx", type: "file" },
        ],
    },
    {
        id: "root-2",
        name: "02_グループワーク",
        type: "folder",
        children: [],
    },
];

export function FileTree() {
    const [files, setFiles] = useState<FileNode[]>(initialFiles);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        // Simulated file upload
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length === 0) return;

        // Create a new folder for the upload batch (Prototype behavior)
        const newFolder: FileNode = {
            id: Math.random().toString(36).substr(2, 9),
            name: `アップロード_${new Date().toLocaleTimeString()}`,
            type: "folder",
            children: droppedFiles.map((file) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: "file",
            })),
        };

        setFiles((prev) => [...prev, newFolder]);
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-500" />
                    フォルダ管理
                </h3>
                <span className="text-xs text-slate-400">Drag & Drop supported</span>
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
                            <TreeNode key={node.id} node={node} level={0} />
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

function TreeNode({ node, level }: { node: FileNode; level: number }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div>
            <div
                className="flex items-center gap-2 py-2 px-2 hover:bg-slate-50 rounded-md cursor-pointer text-sm text-slate-700 select-none group"
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => node.type === "folder" && setIsOpen(!isOpen)}
            >
                <span className="text-slate-400">
                    {node.type === "folder" ? (
                        isOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )
                    ) : (
                        <span className="w-4" />
                    )}
                </span>

                {node.type === "folder" ? (
                    <Folder className={`w-4 h-4 ${isOpen ? "text-blue-500" : "text-slate-400"}`} />
                ) : (
                    <File className="w-4 h-4 text-slate-400" />
                )}

                <span>{node.name}</span>

                {/* Actions (Mock) */}
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:text-red-500 text-slate-300">
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {node.type === "folder" && isOpen && node.children && (
                <div>
                    {node.children.map((child) => (
                        <TreeNode key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
