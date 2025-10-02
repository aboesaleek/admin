import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navLinkClasses = (path: string) =>
    `px-3 py-2 rounded-lg text-sm md:text-base font-semibold transition-all duration-300 relative whitespace-nowrap ${
      location.pathname === path
        ? 'text-white'
        : 'text-slate-300 hover:text-white'
    }`;
    
  const activeLinkIndicator = (path: string) => 
    location.pathname === path 
    ? <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"></span>
    : null;

  return (
    <header className="sticky top-0 z-50 bg-slate-800/90 backdrop-blur-lg shadow-2xl shadow-slate-900/10">
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl md:text-2xl font-extrabold tracking-tight">
            <span className="gradient-text">كشف الحضور</span>
          </Link>
          <div className="hidden md:flex items-center space-x-1 space-x-reverse">
            <Link to="/" className={navLinkClasses('/')}>الرئيسية</Link>
            <Link to="/attendance" className={navLinkClasses('/attendance')}>الحضور</Link>
            <Link to="/permission" className={navLinkClasses('/permission')}>الإذن</Link>
            <Link to="/report/general" className={navLinkClasses('/report/general')}>التقرير العام</Link>
            <Link to="/report/class" className={navLinkClasses('/report/class')}>تقرير الفصل</Link>
            <Link to="/report/student" className={navLinkClasses('/report/student')}>تقرير الطالب</Link>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
            {user && (
                <span className="hidden sm:block text-sm text-slate-400 font-medium">{user.email}</span>
            )}
            <button onClick={signOut} className="bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 hover:text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">
              خروج
            </button>
          </div>
        </div>
        {/* Mobile Nav */}
        <div className="md:hidden flex items-center justify-center space-x-1 space-x-reverse pt-2 mt-2 border-t border-slate-700/50 overflow-x-auto">
            <Link to="/" className={navLinkClasses('/')}>الرئيسية</Link>
            <Link to="/attendance" className={navLinkClasses('/attendance')}>الحضور</Link>
            <Link to="/permission" className={navLinkClasses('/permission')}>الإذن</Link>
            <Link to="/report/general" className={navLinkClasses('/report/general')}>العام</Link>
            <Link to="/report/class" className={navLinkClasses('/report/class')}>الفصل</Link>
            <Link to="/report/student" className={navLinkClasses('/report/student')}>الطالب</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
