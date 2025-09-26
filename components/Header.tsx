import React from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution errors.
import * as ReactRouterDom from 'react-router-dom';

const Header: React.FC = () => {
  const location = ReactRouterDom.useLocation();

  const navLinkClasses = (path: string) =>
    `px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 relative ${
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
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <ReactRouterDom.Link to="/" className="text-2xl font-extrabold tracking-tight">
            <span className="gradient-text">كشف الحضور</span>
          </ReactRouterDom.Link>
          <div className="flex items-center space-x-2 space-x-reverse">
            <ReactRouterDom.Link to="/" className={navLinkClasses('/')}>
              الرئيسية
              {activeLinkIndicator('/')}
            </ReactRouterDom.Link>
            <ReactRouterDom.Link to="/attendance" className={navLinkClasses('/attendance')}>
              تسجيل الحضور
              {activeLinkIndicator('/attendance')}
            </ReactRouterDom.Link>
            <ReactRouterDom.Link to="/permission" className={navLinkClasses('/permission')}>
              تقديم إذن
              {activeLinkIndicator('/permission')}
            </ReactRouterDom.Link>
            <ReactRouterDom.Link to="/report/general" className={navLinkClasses('/report/general')}>
              التقرير العام
              {activeLinkIndicator('/report/general')}
            </ReactRouterDom.Link>
            <ReactRouterDom.Link to="/report/student" className={navLinkClasses('/report/student')}>
              التقرير الفردي
              {activeLinkIndicator('/report/student')}
            </ReactRouterDom.Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;