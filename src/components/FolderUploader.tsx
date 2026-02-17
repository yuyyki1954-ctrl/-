import { useState, useRef, type ChangeEvent } from 'react';
import { Upload, File, Folder, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadStatus {
    name: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
}

export function FolderUploader() {
    const [folderName, setFolderName] = useState<string>('');
    const [files, setFiles] = useState<File[]>([]);
    const [uploadStatuses, setUploadStatuses] = useState<Record<string, FileUploadStatus>>({});
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFolderSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileList = Array.from(e.target.files);
            setFiles(fileList);

            // Try to guess folder name from the first file's path
            // webkitRelativePath usually starts with "FolderName/..."
            const firstFile = fileList[0];
            const path = firstFile.webkitRelativePath;
            if (path) {
                setFolderName(path.split('/')[0]);
            } else {
                setFolderName('新規アップロード');
            }

            // Initialize statuses
            const initialStatuses: Record<string, FileUploadStatus> = {};
            fileList.forEach(f => {
                initialStatuses[f.name] = { name: f.name, status: 'pending', progress: 0 };
            });
            setUploadStatuses(initialStatuses);
        }
    };

    const uploadFiles = async () => {
        setIsUploading(true);

        // 1. Create Folder
        try {
            const folderRes = await fetch('/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: folderName,
                    user_id: localStorage.getItem('user_id'),
                    cohort_id: 'c1' // Hardcoded for MVP
                })
            });
            const folderData = await folderRes.json();
            const folderId = folderData.id;

            // 2. Upload each file
            for (const file of files) {
                setUploadStatuses(prev => ({
                    ...prev,
                    [file.name]: { ...prev[file.name], status: 'uploading' }
                }));

                try {
                    // Get Presigned URL
                    const presignRes = await fetch(`/api/folders/${folderId}/files`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: file.name,
                            size: file.size,
                            type: file.type || 'application/octet-stream'
                        })
                    });
                    const { uploadUrl } = await presignRes.json();

                    // Upload to R2 (or Mock)
                    await fetch(uploadUrl, {
                        method: 'PUT',
                        body: file,
                        headers: {
                            'Content-Type': file.type || 'application/octet-stream'
                        }
                    });

                    setUploadStatuses(prev => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], status: 'completed', progress: 100 }
                    }));

                } catch (error) {
                    console.error(`Error uploading ${file.name}`, error);
                    setUploadStatuses(prev => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], status: 'error' }
                    }));
                }
            }

            // Refresh page or trigger callback (not implemented yet, just alert)
            alert('アップロードが完了しました');
            window.location.reload();

        } catch (error) {
            console.error('Error creating folder', error);
            alert('アップロードを開始できませんでした');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <Folder className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">フォルダを選択</h3>
                <p className="text-slate-500 mt-2">
                    クリックして、成果物を含むフォルダ全体をアップロードしてください。
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    // @ts-ignore - webkitdirectory is non-standard but supported
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleFolderSelect}
                />
            </div>

            {files.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <div>
                            <h4 className="font-semibold text-slate-800">アップロード準備完了</h4>
                            <p className="text-sm text-slate-500">{folderName} • {files.length} ファイル</p>
                        </div>
                        <button
                            onClick={uploadFiles}
                            disabled={isUploading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            {isUploading ? 'アップロード中...' : 'アップロード開始'}
                            <Upload className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                        {Object.values(uploadStatuses).map((status) => (
                            <div key={status.name} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                                <div className="flex items-center gap-3">
                                    <File className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-700 truncate max-w-xs">{status.name}</span>
                                </div>
                                <div className="text-sm">
                                    {status.status === 'pending' && <span className="text-slate-400">待機中</span>}
                                    {status.status === 'uploading' && <span className="text-blue-600 animate-pulse">送信中...</span>}
                                    {status.status === 'completed' && <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> 完了</span>}
                                    {status.status === 'error' && <span className="text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> エラー</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
