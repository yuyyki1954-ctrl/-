import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { ParticipantRegistration } from './pages/ParticipantRegistration';
import { InstructorAuthGuard } from './components/InstructorAuthGuard';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const userId = localStorage.getItem('user_id');
  const location = useLocation();

  if (!userId) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
}

function Layout({ children }: { children: React.ReactNode }) {
  const userName = localStorage.getItem('user_name');
  // const navigate = useNavigate(); // Unused if using window.location

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold text-blue-600">LectureApp</span>
              <nav className="flex gap-4">
                <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  <LayoutDashboard className="h-4 w-4" />
                  受講者ダッシュボード
                </Link>
                <Link to="/instructor" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  <Users className="h-4 w-4" />
                  講師用管理
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {userName && <span className="text-sm text-slate-500">{userName} さん</span>}
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

// Helper for useNavigate inside Layout which is inside Router
function AppContent() {
  return (
    <Routes>
      <Route path="/register" element={<ParticipantRegistration />} />
      <Route path="/" element={
        <AuthGuard>
          <Layout>
            <Dashboard />
          </Layout>
        </AuthGuard>
      } />
      <Route path="/instructor" element={
        <Layout>
          <InstructorAuthGuard>
            <InstructorDashboard />
          </InstructorAuthGuard>
        </Layout>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
