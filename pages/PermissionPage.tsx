import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { Student, ClassName } from '../types';
import { AttendanceStatus } from '../types';
import { CLASS_NAMES } from '../constants';

const PermissionPage: React.FC = () => {
  const { students, addPermissionRecord } = useData();
  const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<AttendanceStatus.PERMISSION | AttendanceStatus.SICK>(AttendanceStatus.PERMISSION);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [searchQuery, students]);

  const handleSelectStudentFromSearch = (student: Student) => {
    setSelectedClass(student.className);
    setSelectedStudentId(student.id);
    setSearchQuery('');
  };

  const handleClassChange = (newClass: ClassName) => {
    setSelectedClass(newClass);
    setSelectedStudentId('');
  };

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.className === selectedClass).sort((a,b) => a.name.localeCompare(b.name));
  }, [selectedClass, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!selectedStudentId || !date || !status) {
      setMessage({ text: 'الرجاء تعبئة جميع الحقول', type: 'error' });
      return;
    }
    try {
      await addPermissionRecord(selectedStudentId, date, status);
      setMessage({ text: 'تم تسجيل طلب الإذن بنجاح!', type: 'success' });
      setSelectedClass('');
      setSelectedStudentId('');
      setStatus(AttendanceStatus.PERMISSION);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: 'حدث خطأ أثناء تسجيل الإذن.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const inputStyle = "block w-full rounded-lg border-slate-300 bg-slate-100 py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all";
  const labelStyle = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-8">
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">تقديم طلب إذن</h1>
        <p className="text-center text-slate-500 mb-8">قم بتسجيل الإذن أو المرض للطالب المحدد</p>
        
        {message && (
          <div
            className={`p-4 rounded-lg relative mb-6 flex items-center shadow-md ${
              message.type === 'success'
                ? 'bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 shadow-emerald-500/10'
                : 'bg-rose-50 border-l-4 border-rose-400 text-rose-800 shadow-rose-500/10'
            }`}
            role="alert"
          >
            {message.type === 'success' ? (
               <svg className="w-6 h-6 ml-3 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
               <svg className="w-6 h-6 ml-3 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            <span className="block sm:inline font-semibold">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="date" className={labelStyle}>التاريخ</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputStyle} required />
          </div>

          <div className="relative">
            <label htmlFor="search" className={labelStyle}>بحث سريع عن طالب</label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="اكتب اسم الطالب..."
              className={inputStyle}
              autoComplete="off"
            />
            {searchQuery && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? searchResults.map(student => (
                        <li key={student.id} onClick={() => handleSelectStudentFromSearch(student)} className="px-4 py-2 cursor-pointer hover:bg-indigo-50">
                            {student.name} <span className="text-sm text-slate-500">({student.className})</span>
                        </li>
                    )) : <li className="px-4 py-2 text-slate-500">لم يتم العثور على الطالب</li>}
                </ul>
            )}
          </div>
          
          <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-slate-500">أو اختر يدويًا</span>
              </div>
          </div>

          <div>
            <label htmlFor="class" className={labelStyle}>اختر الفصل</label>
            <select id="class" value={selectedClass} onChange={(e) => handleClassChange(e.target.value as ClassName)} className={inputStyle} required>
              <option value="" disabled>-- اختر الفصل --</option>
              {CLASS_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          {selectedClass && (
            <div>
              <label htmlFor="student" className={labelStyle}>اختر الطالب</label>
              <select id="student" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className={inputStyle} required>
                <option value="" disabled>-- اختر الطالب --</option>
                {filteredStudents.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </div>
          )}
          
          <div>
              <label className={labelStyle}>الحالة</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center cursor-pointer p-4 rounded-lg border-2 transition-all ${status === AttendanceStatus.PERMISSION ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'border-slate-300 bg-slate-50'}`}>
                  <input type="radio" name="status" value={AttendanceStatus.PERMISSION} checked={status === AttendanceStatus.PERMISSION} onChange={() => setStatus(AttendanceStatus.PERMISSION)} className="ml-3 h-5 w-5 text-indigo-600 border-slate-400 focus:ring-indigo-500" />
                  <span className="text-slate-800 font-bold">إذن</span>
                </label>
                <label className={`flex items-center cursor-pointer p-4 rounded-lg border-2 transition-all ${status === AttendanceStatus.SICK ? 'bg-amber-50 border-amber-500 shadow-md' : 'border-slate-300 bg-slate-50'}`}>
                  <input type="radio" name="status" value={AttendanceStatus.SICK} checked={status === AttendanceStatus.SICK} onChange={() => setStatus(AttendanceStatus.SICK)} className="ml-3 h-5 w-5 text-amber-600 border-slate-400 focus:ring-amber-500" />
                  <span className="text-slate-800 font-bold">مرض</span>
                </label>
              </div>
          </div>

          <button
            type="submit"
            disabled={!selectedStudentId}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1"
          >
            إرسال
          </button>
        </form>
      </div>
    </div>
  );
};

export default PermissionPage;