import React from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution errors.
import * as ReactRouterDom from 'react-router-dom';
import { UserPlusIcon, DocumentAddIcon, ChartBarIcon, UserCircleIcon, Cog6ToothIcon } from '../components/icons';

const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB] overflow-hidden">
      <div className="mesh-gradient"></div>
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight">
            <span className="gradient-text">كشف الغياب والحضور</span>
          </h1>
          <p className="text-xl text-slate-700 mt-4 font-semibold">لطلاب جامعة الإمام الشافعي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
          <ReactRouterDom.Link to="/attendance" className="group glowing-border rounded-2xl">
            <div className="glass-card p-8 rounded-2xl shadow-2xl shadow-slate-900/10 hover:shadow-pink-500/10 transition-all duration-300 text-center flex flex-col items-center justify-center h-full hover:-translate-y-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-5 mb-5 shadow-lg shadow-indigo-500/30">
                <UserPlusIcon className="w-16 h-16 text-white transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">تسجيل الحضور</h2>
              <p className="text-slate-600 mt-2">تسجيل حضور الطلاب في الفصول الدراسية</p>
            </div>
          </ReactRouterDom.Link>
          <ReactRouterDom.Link to="/permission" className="group glowing-border rounded-2xl">
             <div className="glass-card p-8 rounded-2xl shadow-2xl shadow-slate-900/10 hover:shadow-pink-500/10 transition-all duration-300 text-center flex flex-col items-center justify-center h-full hover:-translate-y-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full p-5 mb-5 shadow-lg shadow-emerald-500/30">
                <DocumentAddIcon className="w-16 h-16 text-white transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">تقديم طلب إذن</h2>
              <p className="text-slate-600 mt-2">تقديم طلبات الإذن أو التبليغ عن مرض</p>
            </div>
          </ReactRouterDom.Link>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl glass-card py-4 px-8 rounded-full shadow-xl">
          <ReactRouterDom.Link to="/report/general" className="flex items-center text-lg font-semibold text-slate-800 hover:gradient-text transition-colors">
            <ChartBarIcon className="w-6 h-6 ml-2" />
            التقرير العام
          </ReactRouterDom.Link>
          <div className="border-r-2 border-slate-300 h-6 hidden md:block"></div>
          <ReactRouterDom.Link to="/report/student" className="flex items-center text-lg font-semibold text-slate-800 hover:gradient-text transition-colors">
            <UserCircleIcon className="w-6 h-6 ml-2" />
            التقرير الفردي للطالب
          </ReactRouterDom.Link>
        </div>

        <div className="absolute bottom-6 left-6">
          <ReactRouterDom.Link to="/admin" className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <Cog6ToothIcon className="w-5 h-5 ml-2"/>
            دخول المسؤول
          </ReactRouterDom.Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;