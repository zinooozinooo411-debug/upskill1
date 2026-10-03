import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { InitialSetupView } from './components/auth/InitialSetupView';
import { Header } from './components/common/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { api } from './services/api';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkSetup = async () => {
      try {
        const res = await api.getSetupStatus();
        if (isMounted) {
          setNeedsSetup(res.needsSetup);
        }
      } catch {
        if (isMounted) {
          setNeedsSetup(false);
        }
      }
    };

    if (!user) {
      checkSetup();
    } else {
      setNeedsSetup(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (isLoading || (needsSetup === null && !user)) {
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col items-center justify-center text-xs text-slate-500 font-bold gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-3 border-[#0A4D92] border-t-transparent animate-spin" />
        <span className="text-slate-600 font-medium">جاري تشغيل منصة أب سكيل (Upskill)...</span>
      </div>
    );
  }

  // If no Admin account has ever been created, show the protected First-Time Setup screen
  if (!user && needsSetup) {
    return <InitialSetupView onSetupSuccess={() => setNeedsSetup(false)} />;
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-paper-canvas text-[#0C2340] flex flex-col font-sans">
      <Header />

      <main className="flex-1 pb-12">
        {/* Role-Based Navigation Routing */}
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'teacher' && <TeacherDashboard />}
        {user.role === 'student' && <StudentDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
