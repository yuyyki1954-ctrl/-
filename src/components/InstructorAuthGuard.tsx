import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export function InstructorAuthGuard({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('instructor_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/instructor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('instructor_auth', 'true');
                    setIsAuthenticated(true);
                } else {
                    setError('パスワードが間違っています');
                }
            } else {
                setError('認証に失敗しました');
            }
        } catch (err) {
            setError('エラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200 w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">講師用ログイン</h2>
                    <p className="text-slate-500 text-sm mt-1">閲覧するにはパスワードを入力してください</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワード"
                            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? '確認中...' : 'ログイン'}
                    </button>
                </form>
            </div>
        </div>
    );
}
