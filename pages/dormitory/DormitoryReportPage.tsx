import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { TrashIcon } from '../../components/icons';

type ToastMessage = {
  text: string;
  type: 'success' | 'error';
};

const DormitoryReportPage: React.FC = () => {
  const { dormitories, dormitoryPermissions, deleteDormitoryPermissionRecord } = useData();
  const [filterDormitory, setFilterDormitory] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const filteredRecords = useMemo(() => {
    return dormitoryPermissions
      .filter(record => {
        if (filterDormitory && record.dormitoryId !== filterDormitory) return false;
        if (filterStartDate && record.date < filterStartDate) return false;
        if (filterEndDate && record.date > filterEndDate) return false;
        if (searchQuery && !record.studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dormitoryPermissions, filterDormitory, filterStartDate, filterEndDate, searchQuery]);

  const handleDeleteRecord = async (recordId: string, studentName: string) => {
      if (window.confirm(`هل أنت متأكد من حذف إذن الطالب ${studentName}؟`)) {
          try {
            await deleteDormitoryPermissionRecord(recordId);
            setToastMessage({ text: `تم حذف إذن الطالب ${studentName} بنجاح.`, type: 'success'});
          } catch(error) {
            setToastMessage({ text: 'فشل حذف الإذن.', type: 'error' });
          } finally {
            setTimeout(() => setToastMessage(null), 3000);
          }
      }
  };
  
  const inputStyle = "block w-full rounded-lg border-slate-300 bg-white py-2 px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all";

  return (
    <div className="container mx-auto p-4 md:p-8">
      {toastMessage && (
        <div 
            className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white py-3 px-6 rounded-lg shadow-2xl animate-fade-in-up flex items-center gap-3" 
            role="alert"
            style={{ direction: 'rtl' }}
        >
            {toastMessage.type === 'success' ? (
                <svg className="w-6 h-6 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ) : (
                <svg className="w-6 h-6 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            )}
            <p className="font-semibold">{toastMessage.text}</p>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-8">
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">التقرير العام لأذونات السكن</h1>
        <p className="text-center text-slate-500 mb-8">استعراض وتصفية جميع سجلات أذونات الخروج</p>
        
        <div className="mb-6 p-6 bg-slate-50/70 rounded-xl border border-slate-200/80">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
               <label className="block text-sm font-semibold text-slate-700 mb-2">بحث باسم الطالب</label>
                <input type="text" placeholder="اكتب جزء من الاسم للبحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">تصفية حسب المهجع</label>
              <select onChange={e => setFilterDormitory(e.target.value)} value={filterDormitory} className={inputStyle}>
                <option value="">الكل</option>
                {dormitories.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
        
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-800">
              <tr>
                {['التاريخ', 'اسم الطالب', 'المهجع', 'البيان'].map(header => (
                  <th key={header} className="py-3 px-6 text-right font-semibold text-white text-sm uppercase tracking-wider">{header}</th>
                ))}
                <th className="py-3 px-6 text-center font-semibold text-white text-sm uppercase tracking-wider">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length > 0 ? filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-slate-700 whitespace-nowrap">{record.date}</td>
                  <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">{record.studentName}</td>
                  <td className="py-4 px-6 text-slate-700 whitespace-nowrap">{record.dormitoryName}</td>
                  <td className="py-4 px-6 text-slate-700 whitespace-normal max-w-xs">{record.description || '-'}</td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => handleDeleteRecord(record.id, record.studentName)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-full hover:bg-rose-100"
                      aria-label={`حذف إذن ${record.studentName} بتاريخ ${record.date}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
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

export default DormitoryReportPage;