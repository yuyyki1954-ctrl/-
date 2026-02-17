import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ArrowRight } from 'lucide-react';

export function ParticipantRegistration() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });

            if (res.ok) {
                const user = await res.json();
                // Save to localStorage
                localStorage.setItem('user_id', user.id);
                localStorage.setItem('user_name', user.name);
                localStorage.setItem('user_role', user.role);

                // Redirect to dashboard
                navigate('/');
            } else {
                alert('登録に失敗しました。もう一度お試しください。');
            }
        } catch (error) {
            console.error('Registration failed', error);
            alert('エラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">参加者登録</h1>
                    <p className="text-slate-500 mt-2">お名前とメールアドレスを入力して、ワークスペースを作成してください。</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">お名前</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10 w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="例: 山田 太郎"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="例: taro@example.com"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? '処理中...' : (
                            <>
                                開始する
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
