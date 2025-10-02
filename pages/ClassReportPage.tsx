import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_NAMES } from '../constants';
import type { ClassName } from '../types';
import { AttendanceStatus } from '../types';

interface ClassReportData {
  studentId: string;
  studentName: string;
  absentCount: number;
  permissionCount: number;
  sickCount: number;
  totalByRecord: number;
  totalByDay: number;
}

const ClassReportPage: React.FC = () => {
  const { students, records } = useData();
  const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');

  const reportData = useMemo(() => {
    if (!selectedClass) return [];

    const studentsInClass = students.filter(s => s.className === selectedClass);
    const classRecords = records.filter(r => r.className === selectedClass);
    
    const data = studentsInClass.map(student => {
        const studentRecords = classRecords.filter(r => r.studentId === student.id);
        
        const absentCount = studentRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
        const permissionCount = studentRecords.filter(r => r.status === AttendanceStatus.PERMISSION).length;
        const sickCount = studentRecords.filter(r => r.status === AttendanceStatus.SICK).length;
        const totalByRecord = absentCount + permissionCount + sickCount;

        const uniqueDates = new Set(studentRecords.map(r => r.date));
        const totalByDay = uniqueDates.size;

        return {
            studentId: student.id,
            studentName: student.name,
            absentCount,
            permissionCount,
            sickCount,
            totalByRecord,
            totalByDay
        };
    }).filter(d => d.totalByRecord > 0);

    return data.sort((a, b) => a.studentName.localeCompare(b.studentName, 'ar'));
  }, [selectedClass, students, records]);

  const inputStyle = "block w-full rounded-lg border-slate-300 bg-white py-3 px-4 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all";
  const labelStyle = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-8">
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">التقرير حسب الفصل</h1>
        <p className="text-center text-slate-500 mb-8">ملخص غياب الطلاب لكل فصل دراسي</p>

        <div className="max-w-sm mx-auto mb-8">
          <label htmlFor="class" className={labelStyle}>اختر الفصل لعرض التقرير</label>
          <select id="class" value={selectedClass} onChange={e => setSelectedClass(e.target.value as ClassName)} className={inputStyle}>
            <option value="" disabled>-- اختر الفصل --</option>
            {CLASS_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>

        {selectedClass ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm animate-fade-in">
            <table className="min-w-full bg-white">
              <thead className="bg-slate-800">
                <tr>
                  <th className="py-3 px-4 text-right font-semibold text-white text-sm uppercase tracking-wider">اسم الطالب</th>
                  <th className="py-3 px-4 text-center font-semibold text-white text-sm uppercase tracking-wider">غائب</th>
                  <th className="py-3 px-4 text-center font-semibold text-white text-sm uppercase tracking-wider">إذن</th>
                  <th className="py-3 px-4 text-center font-semibold text-white text-sm uppercase tracking-wider">مرض</th>
                  <th className="py-3 px-4 text-center font-semibold text-white text-sm uppercase tracking-wider">المجموع</th>
                  <th className="py-3 px-4 text-center font-semibold text-white text-sm uppercase tracking-wider">مجموع الأيام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.length > 0 ? reportData.map(data => (
                  <tr key={data.studentId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">{data.studentName}</td>
                    <td className="py-3 px-4 text-center text-slate-700">{data.absentCount}</td>
                    <td className="py-3 px-4 text-center text-slate-700">{data.permissionCount}</td>
                    <td className="py-3 px-4 text-center text-slate-700">{data.sickCount}</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">{data.totalByRecord}</td>
                    <td className="py-3 px-4 text-center font-bold text-purple-600">{data.totalByDay}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-500">
                      <p className="font-bold text-lg">لا توجد سجلات غياب لهذا الفصل.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
            <div className="text-center py-16 text-slate-500 bg-slate-50/70 rounded-xl border-2 border-dashed border-slate-300">
                <div className="flex flex-col items-center">
                    <svg className="w-20 h-20 text-slate-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12.75h7.5" />
                    </svg>
                    <p className="font-bold text-xl">الرجاء اختيار فصل دراسي</p>
                    <p className="text-base">اختر فصلاً من القائمة أعلاه لعرض التقرير.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ClassReportPage;
