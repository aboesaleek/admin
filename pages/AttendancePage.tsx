import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import type { Student, ClassName } from '../types';
import { AttendanceStatus } from '../types';
import { CLASS_NAMES } from '../constants';

const AttendancePage: React.FC = () => {
  const { students, courses, addAttendanceRecords } = useData();
  const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.className === selectedClass).sort((a,b) => a.name.localeCompare(b.name));
  }, [selectedClass, students]);

  useEffect(() => {
    setStudentStatuses({});
  }, [filteredStudents]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatuses(prev => ({ ...prev, [studentId]: status }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedClass || !selectedCourse || filteredStudents.length === 0) {
      setMessage({ text: 'الرجاء اختيار الفصل والمادة الدراسية.', type: 'error' });
      return;
    }
    
    const recordsToSubmit = filteredStudents
      .filter(student => studentStatuses[student.id])
      .map(student => ({
        studentId: student.id,
        status: studentStatuses[student.id]!,
      }));

    if (recordsToSubmit.length === 0) {
      setMessage({ text: 'الرجاء تحديد حالة طالب واحد على الأقل.', type: 'error' });
      return;
    }
    
    addAttendanceRecords(recordsToSubmit, date, selectedCourse, selectedClass);
    
    setMessage({ text: 'تم حفظ بيانات الحضور بنجاح!', type: 'success' });
    setStudentStatuses({});
    setTimeout(() => setMessage(null), 3000);
  };
  
  const inputStyle = "block w-full rounded-lg border-slate-300 bg-slate-100 py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all";
  const labelStyle = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-8">
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">تسجيل الحضور</h1>
        <p className="text-center text-slate-500 mb-8">اختر الفصل والمادة ثم قم بتسجيل حالات الغياب</p>

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label htmlFor="class" className={labelStyle}>اختر الفصل</label>
            <select id="class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value as ClassName)} className={inputStyle}>
              <option value="" disabled>-- اختر الفصل --</option>
              {CLASS_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="date" className={labelStyle}>التاريخ</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputStyle} />
          </div>
          <div>
            <label htmlFor="course" className={labelStyle}>المادة الدراسية</label>
            <select id="course" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className={inputStyle} disabled={!selectedClass}>
              <option value="" disabled>-- اختر المادة --</option>
              {courses.map(course => <option key={course.id} value={course.name}>{course.name}</option>)}
            </select>
          </div>
        </div>

        {selectedClass && (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
              <table className="min-w-full bg-white">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="py-3 px-6 text-right font-semibold text-white text-sm uppercase tracking-wider">اسم الطالب</th>
                    <th className="py-3 px-6 text-center font-semibold text-white text-sm uppercase tracking-wider">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-800">{student.name}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center space-x-4 space-x-reverse">
                          {[AttendanceStatus.ABSENT, AttendanceStatus.PERMISSION, AttendanceStatus.SICK].map(status => (
                            <label key={status} className={`cursor-pointer px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${studentStatuses[student.id] === status ? 'text-white shadow-md' : 'text-slate-600 bg-slate-100 border-slate-200'}
                              ${status === AttendanceStatus.ABSENT && studentStatuses[student.id] === status ? 'bg-rose-500 border-rose-600' : ''}
                              ${status === AttendanceStatus.PERMISSION && studentStatuses[student.id] === status ? 'bg-amber-500 border-amber-600' : ''}
                              ${status === AttendanceStatus.SICK && studentStatuses[student.id] === status ? 'bg-orange-500 border-orange-600' : ''}
                            `}>
                              <input
                                type="radio"
                                name={`status-${student.id}`}
                                value={status}
                                checked={studentStatuses[student.id] === status}
                                onChange={() => handleStatusChange(student.id, status)}
                                className="sr-only"
                              />
                              <span>{status}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="submit" className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1">
              حفظ البيانات
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;