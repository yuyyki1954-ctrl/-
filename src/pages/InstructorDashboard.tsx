import { useEffect, useState } from 'react';
import { Folder, User, Star, File } from 'lucide-react';

interface FolderData {
    id: string;
    name: string;
    user_id: string; // In real app, join with users table to get name
    created_at: string;
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
}

export function InstructorDashboard() {
    // State
    const [users, setUsers] = useState<{ id: string, name: string, email: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserFolderId, setSelectedUserFolderId] = useState<string | null>(null);
    const [folderFiles, setFolderFiles] = useState<FileData[]>([]);
    const [evaluation, setEvaluation] = useState<{ score: number, comments: string }>({ score: 3, comments: '' });
    const [existingEvaluations, setExistingEvaluations] = useState<(Evaluation & { attachment_key?: string, attachment_name?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchUsers();
    }, []);

    // When User Selected, Fetch their Portfolio Folder
    useEffect(() => {
        if (selectedUserId) {
            fetchUserPortfolio(selectedUserId);
        } else {
            setFolderFiles([]);
            setExistingEvaluations([]);
            setSelectedUserFolderId(null);
        }
    }, [selectedUserId]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUserPortfolio = async (userId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/folders?user_id=${userId}`);
            if (res.ok) {
                const folders: FolderData[] = await res.json();
                if (folders.length > 0) {
                    const portfolio = folders.find(f => f.name === 'My Portfolio') || folders[0];
                    setSelectedUserFolderId(portfolio.id);
                    fetchFiles(portfolio.id);
                    fetchEvaluations(portfolio.id);
                } else {
                    setSelectedUserFolderId(null);
                    setFolderFiles([]);
                    setExistingEvaluations([]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
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
                setExistingEvaluations(data);
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

    const handleSubmitEvaluation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserFolderId) return;
        setIsSubmitting(true);

        try {
            let attachmentKey = '';
            let attachmentName = '';

            if (attachment) {
                // 1. Get Presigned URL
                const uploadRes = await fetch('/api/evaluations/upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: attachment.name, type: attachment.type })
                });

                if (!uploadRes.ok) throw new Error('Failed to get upload URL');
                const { uploadUrl, key } = await uploadRes.json();

                // 2. Upload to R2
                const putRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': attachment.type },
                    body: attachment
                });

                if (!putRes.ok) throw new Error('Failed to upload file');

                attachmentKey = key;
                attachmentName = attachment.name;
            }

            // 3. Submit Evaluation
            await fetch('/api/evaluations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    folder_id: selectedUserFolderId,
                    instructor_id: 'u2', // Hardcoded instructor
                    score: evaluation.score,
                    comments: evaluation.comments,
                    attachment_key: attachmentKey || undefined,
                    attachment_name: attachmentName || undefined
                })
            });
            alert('評価を送信しました');
            fetchEvaluations(selectedUserFolderId);
            setEvaluation({ score: 3, comments: '' });
            setAttachment(null);
        } catch (error) {
            console.error(error);
            alert('評価の送信に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-100px)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-full">
                {/* List of Students */}
                <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-slate-200 p-4 h-full overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                        <User className="h-5 w-5 text-blue-600" />
                        受講生一覧
                    </h2>
                    <div className="space-y-2">
                        {users.map(user => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUserId(user.id)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedUserId === user.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-slate-50 border-transparent hover:border-slate-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedUserId === user.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-sm font-medium text-slate-800 truncate">{user.name}</div>
                                        <div className="text-xs text-slate-400 truncate">{user.email || 'No email'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Panel */}
                <div className="md:col-span-3 space-y-6">
                    {selectedUserId ? (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {users.find(u => u.id === selectedUserId)?.name} のポートフォリオ
                                </h2>
                                {selectedUserFolderId && (
                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Folder ID: {selectedUserFolderId.slice(0, 8)}...</span>
                                )}
                            </div>

                            {!selectedUserFolderId && !isLoading && (
                                <div className="p-8 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-500">
                                    <Folder className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                                    <p>ポートフォリオがまだ作成されていません。</p>
                                </div>
                            )}

                            {selectedUserFolderId && (
                                <>
                                    {/* Files Review Section */}
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                                        <h3 className="text-md font-semibold mb-4 text-slate-700 flex items-center gap-2">
                                            <File className="h-4 w-4 text-slate-500" />
                                            提出ファイル
                                        </h3>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {folderFiles.length === 0 ? (
                                                <p className="text-sm text-slate-400 italic">ファイルがありません</p>
                                            ) : (
                                                folderFiles.map(file => (
                                                    <div key={file.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded border border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 bg-blue-50 text-blue-500 rounded flex items-center justify-center">
                                                                <File className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <button onClick={() => handleDownload(file)} className="text-sm font-medium text-blue-600 hover:underline text-left">
                                                                    {file.name}
                                                                </button>
                                                                <div className="text-xs text-slate-400">
                                                                    {new Date(file.created_at).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Evaluation Form */}
                                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                                            <h2 className="text-lg font-semibold mb-4 text-slate-800">評価・フィードバック</h2>
                                            <form onSubmit={handleSubmitEvaluation} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">評価スコア</label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4].map(score => (
                                                            <button
                                                                key={score}
                                                                type="button"
                                                                onClick={() => setEvaluation({ ...evaluation, score })}
                                                                className={`flex-1 py-2 rounded-md font-bold border transition-all ${evaluation.score === score ? 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                            >
                                                                {score}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">コメント</label>
                                                    <textarea
                                                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        rows={4}
                                                        value={evaluation.comments}
                                                        onChange={e => setEvaluation({ ...evaluation, comments: e.target.value })}
                                                        placeholder="フィードバックを入力..."
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">ファイル添付 (任意)</label>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                                                        className="block w-full text-sm text-slate-500
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded-full file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-blue-50 file:text-blue-700
                                                            hover:file:bg-blue-100"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? '送信中...' : '送信する'}
                                                </button>
                                            </form>
                                        </div>

                                        {/* History */}
                                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 bg-slate-50/50">
                                            <h3 className="text-md font-semibold mb-4 text-slate-700">過去の履歴</h3>
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                                {existingEvaluations.map(ev => (
                                                    <div key={ev.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm text-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold text-xs flex items-center gap-1">
                                                                    {ev.score} <Star className="h-3 w-3 fill-yellow-500" />
                                                                </span>
                                                                <span className="text-xs text-slate-400">{new Date(ev.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-600 whitespace-pre-wrap">{ev.comments}</p>
                                                        {ev.attachment_key && (
                                                            <div className="mt-2 pt-2 border-t border-slate-100">
                                                                <button
                                                                    onClick={() => handleAttachmentDownload(ev.attachment_key!, ev.attachment_name!)}
                                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                                >
                                                                    <File className="h-3 w-3" />
                                                                    {ev.attachment_name || '添付ファイル'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {existingEvaluations.length === 0 && <p className="text-slate-400 text-sm italic text-center py-4">履歴データなし</p>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-lg border border-slate-200 border-dashed p-12">
                            <User className="h-16 w-16 mb-4 text-slate-300" />
                            <p className="text-lg">受講生を選択してください</p>
                            <p className="text-sm">左側のリストから詳細を確認したい受講生をクリックしてください。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
