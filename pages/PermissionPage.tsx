import React, { useState, useMemo, useEffect } from 'react';
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
  const [message, setMessage] = useState<string>('');

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.className === selectedClass);
  }, [selectedClass, students]);

  useEffect(() => {
    setSelectedStudentId('');
  }, [selectedClass]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !date || !status) {
      setMessage('الرجاء تعبئة جميع الحقول');
      return;
    }
    addPermissionRecord(selectedStudentId, date, status);
    setMessage('تم تسجيل طلب الإذن بنجاح!');
    setSelectedClass('');
    setSelectedStudentId('');
    setStatus(AttendanceStatus.PERMISSION);
    setTimeout(() => setMessage(''), 3000);
  };

  const inputStyle = "block w-full rounded-lg border-slate-300 bg-slate-100 py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all";
  const labelStyle = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-8">
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">تقديم طلب إذن</h1>
        <p className="text-center text-slate-500 mb-8">قم بتسجيل الإذن أو المرض للطالب المحدد</p>
        
        {message && (
          <div className="bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 p-4 rounded-lg relative mb-6 flex items-center shadow-md shadow-emerald-500/10" role="alert">
             <svg className="w-6 h-6 ml-3 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="block sm:inline font-semibold">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="date" className={labelStyle}>التاريخ</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputStyle} required />
          </div>

          <div>
            <label htmlFor="class" className={labelStyle}>اختر الفصل</label>
            <select id="class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value as ClassName)} className={inputStyle} required>
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