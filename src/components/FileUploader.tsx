import { useState, useRef } from 'react';
import { Upload, File, CheckCircle, AlertCircle, X } from 'lucide-react';

interface FileUploadStatus {
    name: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
}

interface FileUploaderProps {
    folderId: string;
    onUploadComplete: () => void;
}

export function FileUploader({ folderId, onUploadComplete }: FileUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploadStatuses, setUploadStatuses] = useState<Record<string, FileUploadStatus>>({});
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            setFiles(prev => [...prev, ...fileList]);

            // Initialize statuses
            const newStatuses: Record<string, FileUploadStatus> = { ...uploadStatuses };
            fileList.forEach(f => {
                newStatuses[f.name] = { name: f.name, status: 'pending', progress: 0 };
            });
            setUploadStatuses(newStatuses);
        }
    };

    const removeFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.name !== fileName));
        const newStatuses = { ...uploadStatuses };
        delete newStatuses[fileName];
        setUploadStatuses(newStatuses);
    };

    const uploadFiles = async () => {
        setIsUploading(true);

        // Upload each file
        for (const file of files) {
            if (uploadStatuses[file.name]?.status === 'completed') continue;

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

                if (!presignRes.ok) throw new Error('Failed to get presigned URL');

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

        setIsUploading(false);

        // Check if all completed
        // const allCompleted = files.every(f => uploadStatuses[f.name]?.status === 'completed' || uploadStatuses[f.name]?.status === 'completed' ); // logic check

        // Clear legacy/completed files from list after a short delay or let user clear?
        // For now, trigger callback
        onUploadComplete();
        setFiles([]); // Clear list on success
        setUploadStatuses({});
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    <Upload className="h-4 w-4" />
                    ファイルを追加
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                />
                {files.length > 0 && (
                    <button
                        onClick={uploadFiles}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isUploading ? 'アップロード中...' : `${files.length}ファイルをアップロード`}
                    </button>
                )}
            </div>

            {files.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                    {files.map((file) => {
                        const status = uploadStatuses[file.name];
                        return (
                            <div key={file.name} className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-700 truncate max-w-xs">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {status?.status === 'pending' && (
                                        <button onClick={() => removeFile(file.name)} className="text-slate-400 hover:text-red-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    {status?.status === 'uploading' && <span className="text-xs text-blue-600">送信中...</span>}
                                    {status?.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    {status?.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
