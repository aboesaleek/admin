import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cog6ToothIcon, LoginIcon, AcademicIcon, DormitoryIcon } from '../components/icons';

const ModuleCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: 'indigo' | 'emerald' | 'slate';
  animationDelay: string;
}> = ({ icon, title, description, color, animationDelay }) => {
    const colorClasses = {
        indigo: 'from-indigo-500 to-purple-600 shadow-indigo-500/30',
        emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
        slate: 'from-slate-600 to-slate-800 shadow-slate-600/30',
    };
    return (
        <Link to={`/${title === 'Akademik' ? 'academic' : title === 'Asrama (مهجع)' ? 'dormitory' : 'admin'}`} 
              className="group glowing-border rounded-2xl animate-fade-in-up" 
              style={{ animationDelay }}>
            <div className="glass-card p-8 rounded-2xl shadow-2xl shadow-slate-900/10 hover:shadow-pink-500/10 transition-all duration-300 text-center flex flex-col items-center justify-center h-full hover:-translate-y-2">
                <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-full p-5 mb-5 shadow-lg`}>
                    {icon}
                </div>
                <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
                <p className="text-slate-600 mt-2 text-lg">{description}</p>
            </div>
        </Link>
    );
};


const LandingPage: React.FC = () => {
  const { session, profile, loading, signOut } = useAuth();
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-[#F9FAFB]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
        </div>
    );
  }
  
  const isLoggedIn = !!session && !!profile;
  
  const canAccessAcademic = isLoggedIn && (profile.role === 'admin' || profile.role === 'academic');
  const canAccessDormitory = isLoggedIn && (profile.role === 'admin' || profile.role === 'dormitory');
  const canAccessAdmin = isLoggedIn && profile.role === 'admin';
  
  const renderLoggedInView = () => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
          {canAccessAcademic && (
            <ModuleCard 
              icon={<AcademicIcon className="w-16 h-16 text-white" />}
              title="Akademik"
              description="إدارة الحضور والغياب الأكاديمي"
              color="indigo"
              animationDelay="0.3s"
            />
          )}
          {canAccessDormitory && (
             <ModuleCard 
              icon={<DormitoryIcon className="w-16 h-16 text-white" />}
              title="Asrama (مهجع)"
              description="إدارة أذونات الخروج والعودة"
              color="emerald"
              animationDelay="0.5s"
            />
          )}
        </div>
        
        {canAccessAdmin && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <Link to="/admin" className="inline-flex items-center gap-3 text-lg font-semibold text-slate-800 hover:gradient-text transition-colors glass-card py-4 px-8 rounded-full shadow-xl">
                  <Cog6ToothIcon className="w-7 h-7" />
                  الإدارة العامة
              </Link>
          </div>
        )}
    </>
  );

  const renderLoggedOutView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <ModuleCard 
            icon={<AcademicIcon className="w-16 h-16 text-white" />}
            title="Akademik"
            description="إدارة الحضور والغياب الأكاديمي"
            color="indigo"
            animationDelay="0.3s"
        />
        <ModuleCard 
            icon={<DormitoryIcon className="w-16 h-16 text-white" />}
            title="Asrama (مهجع)"
            description="إدارة أذونات الخروج والعودة"
            color="emerald"
            animationDelay="0.5s"
        />
        <ModuleCard 
            icon={<Cog6ToothIcon className="w-16 h-16 text-white" />}
            title="Admin Umum"
            description="الدخول للمسؤولين فقط"
            color="slate"
            animationDelay="0.7s"
        />
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB] overflow-hidden">
      <div className="mesh-gradient"></div>
      
       <header className="absolute top-0 left-0 right-0 p-4 z-20">
        <div className="container mx-auto flex justify-end items-center">
        {isLoggedIn ? (
            <div className="flex items-center gap-4 glass-card p-2 px-4 rounded-full shadow-lg">
                <span className="text-sm font-semibold text-slate-700">{profile.email}</span>
                <button onClick={signOut} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 hover:text-white text-sm font-bold py-2 px-3 rounded-full transition-colors">
                    خروج
                </button>
            </div>
        ) : (
            <Link to="/login" className="inline-flex items-center gap-2 text-md font-semibold text-slate-800 hover:gradient-text transition-colors glass-card py-2 px-6 rounded-full shadow-lg">
                <LoginIcon className="w-5 h-5" />
                تسجيل الدخول
            </Link>
        )}
        </div>
      </header>
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 z-10">
        <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight">
            <span className="gradient-text">نظام كشف الحضور والأذونات</span>
          </h1>
          <p className="text-xl text-slate-700 mt-4 font-semibold">جامعة الإمام الشافعي</p>
        </div>

        {isLoggedIn ? renderLoggedInView() : renderLoggedOutView()}

      </div>
    </div>
  );
};

export default LandingPage;
