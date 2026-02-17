import Link from "next/link";
import { Folder, Upload, Users, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg tracking-tight text-slate-800">
              LectureBox
            </span>
          </div>
          <nav>
            <Link
              href="/app"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm hover:shadow-md"
            >
              アプリを試す
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-6 tracking-wide uppercase">
            For Medical & Education
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            講習会・研修の<br className="md:hidden" />
            資料管理を<span className="text-blue-600">スマート</span>に。
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            参加者ごとのフォルダ作成、課題提出、振り返り管理をワンストップで。
            <br />
            医療・教育現場のために設計された、シンプルでセキュアなプラットフォーム。
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/app"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full text-base font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              デモアプリを起動
            </Link>
            <a
              href="#features"
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-full text-base font-semibold transition-all shadow-sm hover:shadow-md"
            >
              機能を見る
            </a>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <FeatureCard
                icon={<Users className="w-8 h-8 text-blue-500" />}
                title="参加者管理"
                description="期（Cohort）ごとに参加者を整理。個別の進捗状況や提出物を一覧で確認できます。"
              />
              <FeatureCard
                icon={<Upload className="w-8 h-8 text-blue-500" />}
                title="ドラッグ＆ドロップ提出"
                description="複雑な操作は不要。ファイルをドラッグするだけで、直感的にフォルダへ整理・アップロード。"
              />
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8 text-blue-500" />}
                title="セキュア＆ローカル"
                description="データは安全に管理。管理者と参加者のアクセス権限を適切に分離します。"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto bg-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>
            <h2 className="text-3xl font-bold mb-4 relative z-10">今すぐ体験してみましょう</h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto relative z-10">
              登録不要で、アプリのプロトタイプをすぐにお試しいただけます。
            </p>
            <Link
              href="/app"
              className="inline-block bg-white text-blue-700 px-8 py-3.5 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-colors relative z-10"
            >
              アプリを開く
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200 text-slate-500 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} LectureBox. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
      <div className="mb-4 p-3 bg-white rounded-xl shadow-sm border border-slate-100">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
