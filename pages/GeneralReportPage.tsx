import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_NAMES } from '../constants';
import type { ClassName, Record } from '../types';
import { DocumentArrowDownIcon } from '../components/icons';

declare const XLSX: any; // For SheetJS library loaded from CDN

const GeneralReportPage: React.FC = () => {
  const { records, courses } = useData();
  const [filterClass, setFilterClass] = useState<ClassName | ''>('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        if (filterClass && record.className !== filterClass) return false;
        if (filterCourse && record.course !== filterCourse) return false;
        if (filterStartDate && record.date < filterStartDate) return false;
        if (filterEndDate && record.date > filterEndDate) return false;
        if (searchQuery && !record.studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // Sort by most recent date
  }, [records, filterClass, filterCourse, filterStartDate, filterEndDate, searchQuery]);

  const exportToExcel = () => {
    const dataToExport = filteredRecords.map(r => ({
      'التاريخ': r.date,
      'اسم الطالب': r.studentName,
      'الفصل': r.className,
      'المادة الدراسية': r.course || '-',
      'الحالة': r.status,
      'النوع': r.type === 'attendance' ? 'حضور' : 'إذن',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "التقرير العام");
    XLSX.writeFile(workbook, "التقرير_العام.xlsx");
  };

  const statusBadge = (status: string) => {
      switch(status) {
          case 'غائب': return 'bg-rose-100 text-rose-700 border border-rose-200';
          case 'إذن': return 'bg-amber-100 text-amber-700 border border-amber-200';
          case 'مرض': return 'bg-orange-100 text-orange-700 border border-orange-200';
          default: return 'bg-slate-100 text-slate-700 border border-slate-200';
      }
  }
  
  const inputStyle = "block w-full rounded-lg border-slate-300 bg-white py-2 px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-8">
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">التقرير العام</h1>
        <p className="text-center text-slate-500 mb-8">استعراض وتصفية جميع سجلات الحضور والإذن</p>
        
        <div className="mb-6 p-6 bg-slate-50/70 rounded-xl border border-slate-200/80">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
               <label className="block text-sm font-semibold text-slate-700 mb-2">بحث باسم الطالب</label>
                <input
                  type="text"
                  placeholder="اكتب جزء من الاسم للبحث..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={inputStyle}
                />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">تصفية حسب الفصل</label>
              <select onChange={e => setFilterClass(e.target.value as ClassName)} value={filterClass} className={inputStyle}>
                <option value="">الكل</option>
                {CLASS_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">تصفية حسب المادة</label>
              <select onChange={e => setFilterCourse(e.target.value)} value={filterCourse} className={inputStyle}>
                <option value="">الكل</option>
                {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">من تاريخ</label>
              <input type="date" onChange={e => setFilterStartDate(e.target.value)} value={filterStartDate} className={inputStyle}/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">إلى تاريخ</label>
              <input type="date" onChange={e => setFilterEndDate(e.target.value)} value={filterEndDate} className={inputStyle}/>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mb-4">
            <button onClick={exportToExcel} className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5">
                <DocumentArrowDownIcon className="w-5 h-5"/>
                <span>تصدير إلى Excel</span>
            </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-800">
              <tr>
                {['التاريخ', 'اسم الطالب', 'الفصل', 'المادة الدراسية', 'الحالة'].map(header => (
                  <th key={header} className="py-3 px-6 text-right font-semibold text-white text-sm uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length > 0 ? filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-slate-700 whitespace-nowrap">{record.date}</td>
                  <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">{record.studentName}</td>
                  <td className="py-4 px-6 text-slate-700 whitespace-nowrap">{record.className}</td>
                  <td className="py-4 px-6 text-slate-700 whitespace-nowrap">{record.course || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusBadge(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                        <p className="font-bold text-lg">لا توجد سجلات لعرضها.</p>
                        <p className="text-sm">جرب تغيير معايير التصفية أو البحث.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneralReportPage;