import { useEffect, useState } from 'react';
import { File, MessageSquare, Star } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';

interface FolderData {
    id: string;
    name: string;
    created_at: string;
    file_count?: number;
}

interface FileData {
    id: string;
    name: string;
    size: number;
    type: string;
    r2_key: string;
    created_at: string;
}

interface Evaluation {
    id: string;
    score: number;
    comments: string;
    instructor_id: string;
    created_at: string;
    attachment_key?: string;
    attachment_name?: string;
}

export function Dashboard() {
    const [portfolioFolder, setPortfolioFolder] = useState<FolderData | null>(null);
    const [folderFiles, setFolderFiles] = useState<FileData[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch or Create Portfolio Folder on mount
    useEffect(() => {
        initializePortfolio();
    }, []);

    const initializePortfolio = async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        setIsLoading(true);
        try {
            // 1. Check for existing folders
            const res = await fetch(`/api/folders?user_id=${userId}`);

            if (res.ok) {
                const folders: FolderData[] = await res.json();
                if (folders.length > 0) {
                    // Use the first folder as Portfolio (or find one named 'Portfolio')
                    const portfolio = folders.find(f => f.name === 'My Portfolio') || folders[0];
                    setPortfolioFolder(portfolio);
                    await refreshFolderContents(portfolio.id);
                } else {
                    // 2. If no folder, create one
                    const createRes = await fetch('/api/folders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: 'My Portfolio',
                            user_id: userId,
                            cohort_id: 'c1'
                        })
                    });
                    if (createRes.ok) {
                        const newFolder = await createRes.json();
                        setPortfolioFolder(newFolder);
                        setFolderFiles([]);
                        setEvaluations([]);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to initialize portfolio', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshFolderContents = async (folderId: string) => {
        await fetchFiles(folderId);
        await fetchEvaluations(folderId);
    };

    const fetchFiles = async (folderId: string) => {
        try {
            const res = await fetch(`/api/folders/${folderId}/files`);
            if (res.ok) {
                const data = await res.json();
                setFolderFiles(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEvaluations = async (folderId: string) => {
        try {
            const res = await fetch(`/api/folders/${folderId}/evaluations`);
            if (res.ok) {
                const data = await res.json();
                setEvaluations(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownload = async (file: FileData) => {
        try {
            const res = await fetch(`/api/files/${file.id}/download`);
            if (res.ok) {
                const { downloadUrl } = await res.json();
                window.open(downloadUrl, '_blank');
            } else {
                alert('ダウンロードリンクの取得に失敗しました');
            }
        } catch (error) {
            console.error(error);
            alert('工ラーが発生しました');
        }
    };

    const handleAttachmentDownload = async (key: string, name: string) => {
        try {
            const res = await fetch(`/api/download?key=${encodeURIComponent(key)}&name=${encodeURIComponent(name)}`);
            if (res.ok) {
                const { downloadUrl } = await res.json();
                window.open(downloadUrl, '_blank');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className="text-center py-12 text-slate-500">読み込み中...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">マイ ポートフォリオ</h1>
                <div className="text-sm text-slate-500">
                    Folder ID: {portfolioFolder?.id.slice(0, 8)}...
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Files */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upload Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <File className="h-5 w-5 text-blue-600" />
                            ファイルアップロード
                        </h2>
                        {portfolioFolder && (
                            <FileUploader
                                folderId={portfolioFolder.id}
                                onUploadComplete={() => refreshFolderContents(portfolioFolder.id)}
                            />
                        )}
                    </div>

                    {/* File List */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">アップロード済みファイル</h2>
                        <div className="space-y-2">
                            {folderFiles.length === 0 ? (
                                <p className="text-slate-400 text-sm py-4 text-center italic">まだファイルがありません</p>
                            ) : (
                                folderFiles.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded border border-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                                <File className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <button onClick={() => handleDownload(file)} className="font-medium text-slate-700 hover:text-blue-600 hover:underline text-left">
                                                    {file.name}
                                                </button>
                                                <div className="text-xs text-slate-400">
                                                    {new Date(file.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Feedback */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                            講師からのフィードバック
                        </h2>

                        <div className="space-y-4">
                            {evaluations.map(ev => (
                                <div key={ev.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold text-xs flex items-center gap-1">
                                                {ev.score} <Star className="h-3 w-3 fill-yellow-500" />
                                            </span>
                                            <span className="text-xs text-slate-400">{new Date(ev.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ev.comments}</p>
                                    {/* Attachment Display */}
                                    {ev.attachment_key && (
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                            <button
                                                onClick={() => handleAttachmentDownload(ev.attachment_key!, ev.attachment_name!)}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-3 py-2 rounded-md w-full"
                                            >
                                                <File className="h-4 w-4" />
                                                <span className="truncate">{ev.attachment_name || '添付ファイル'}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {evaluations.length === 0 && (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    <p>まだ評価はありません。</p>
                                    <p className="text-xs mt-1">課題を提出して評価を待ちましょう。</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

