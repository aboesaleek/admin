import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlusIcon, 
  DocumentAddIcon, 
  ChartBarIcon, 
  UserCircleIcon, 
  DocumentReportIcon,
  UsersIcon,
  UserMinusIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
} from '../components/icons';
import { useData } from '../context/DataContext';
import { CLASS_NAMES } from '../constants';
import { AttendanceStatus } from '../types';

const StatCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'blue' | 'red' | 'amber' | 'violet';
}> = ({ icon, value, label, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/30',
    red: 'from-red-500 to-rose-600 shadow-rose-500/30',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/30',
    violet: 'from-violet-500 to-purple-600 shadow-violet-500/30',
  };

  return (
    <div className="glass-card p-5 rounded-2xl shadow-lg shadow-slate-900/5 flex items-center gap-4">
      <div className={`p-4 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-800">{value}</p>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { students, records } = useData();
  
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todaysStats = useMemo(() => {
    const todaysRecords = records.filter(r => r.date === today);
    const absences = todaysRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const permissions = todaysRecords.filter(r => r.status === AttendanceStatus.PERMISSION || r.status === AttendanceStatus.SICK).length;
    return { absences, permissions };
  }, [records, today]);

  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB] overflow-hidden">
      <div className="mesh-gradient"></div>
      
      <div className="relative container mx-auto p-4 md:p-8 z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            <span className="gradient-text">اللوحة الرئيسية الأكاديمية</span>
          </h1>
          <p className="text-lg text-slate-700 mt-3 font-semibold">نظرة عامة على الأنشطة اليومية</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}><StatCard icon={<UsersIcon className="w-7 h-7" />} value={students.length} label="إجمالي الطلاب" color="blue"/></div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}><StatCard icon={<UserMinusIcon className="w-7 h-7" />} value={todaysStats.absences} label="غياب اليوم" color="red"/></div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}><StatCard icon={<ClipboardDocumentCheckIcon className="w-7 h-7" />} value={todaysStats.permissions} label="إذن / مرض اليوم" color="amber"/></div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}><StatCard icon={<BookOpenIcon className="w-7 h-7" />} value={CLASS_NAMES.length} label="إجمالي الفصول" color="violet"/></div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto mb-12">
          <Link to="/academic/attendance" className="group glowing-border rounded-2xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="glass-card p-8 rounded-2xl shadow-2xl shadow-slate-900/10 hover:shadow-pink-500/10 transition-all duration-300 text-center flex flex-col items-center justify-center h-full hover:-translate-y-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-5 mb-5 shadow-lg shadow-indigo-500/30">
                <UserPlusIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">تسجيل الحضور</h2>
              <p className="text-slate-600 mt-2">تسجيل حضور الطلاب في الفصول الدراسية</p>
            </div>
          </Link>
          <Link to="/academic/permission" className="group glowing-border rounded-2xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
             <div className="glass-card p-8 rounded-2xl shadow-2xl shadow-slate-900/10 hover:shadow-pink-500/10 transition-all duration-300 text-center flex flex-col items-center justify-center h-full hover:-translate-y-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full p-5 mb-5 shadow-lg shadow-emerald-500/30">
                <DocumentAddIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">تقديم طلب إذن</h2>
              <p className="text-slate-600 mt-2">تقديم طلبات الإذن أو التبليغ عن مرض</p>
            </div>
          </Link>
        </div>
        
        {/* Reports Section */}
        <div className="max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
           <div className="glass-card p-8 rounded-2xl shadow-2xl shadow-slate-900/10">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">التقارير</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Link to="/academic/report/general" className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-slate-200/50 transition-colors">
                    <ChartBarIcon className="w-10 h-10 mb-2 text-indigo-500" />
                    <h3 className="font-bold text-slate-700">التقرير العام</h3>
                    <p className="text-sm text-slate-500">عرض جميع السجلات مع التصفية</p>
                  </Link>
                 <Link to="/academic/report/class" className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-slate-200/50 transition-colors">
                    <DocumentReportIcon className="w-10 h-10 mb-2 text-purple-500" />
                    <h3 className="font-bold text-slate-700">تقرير الفصل</h3>
                    <p className="text-sm text-slate-500">ملخص الغياب لكل فصل</p>
                  </Link>
                 <Link to="/academic/report/student" className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-slate-200/50 transition-colors">
                    <UserCircleIcon className="w-10 h-10 mb-2 text-emerald-500" />
                    <h3 className="font-bold text-slate-700">تقرير الطالب</h3>
                    <p className="text-sm text-slate-500">عرض سجلات طالب معين</p>
                  </Link>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;