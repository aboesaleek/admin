import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_NAMES } from '../constants';
import type { ClassName } from '../types';
import { AttendanceStatus } from '../types';
import { DocumentArrowDownIcon } from '../components/icons';

// Declare jsPDF and Chart.js types for CDN-loaded libraries
declare const jspdf: any;
declare const Chart: any;

const StudentReportPage: React.FC = () => {
  const { students, records } = useData();
  const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students
      .filter(s => s.className === selectedClass)
      .filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [selectedClass, students, studentSearchQuery]);

  const studentRecords = useMemo(() => {
    if (!selectedStudentId) return [];
    return records
      .filter(r => r.studentId === selectedStudentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedStudentId, records]);

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [selectedStudentId, students]);
  
  const absenceSummary = useMemo(() => {
    if (!studentRecords.length) {
      return { absent: 0, permission: 0, sick: 0, totalDays: 0 };
    }

    const uniqueDaysByStatus: { [key in AttendanceStatus]?: Set<string> } = {};

    studentRecords.forEach(record => {
      if (!uniqueDaysByStatus[record.status]) {
        uniqueDaysByStatus[record.status] = new Set();
      }
      uniqueDaysByStatus[record.status]!.add(record.date);
    });

    const absent = uniqueDaysByStatus[AttendanceStatus.ABSENT]?.size || 0;
    const permission = uniqueDaysByStatus[AttendanceStatus.PERMISSION]?.size || 0;
    const sick = uniqueDaysByStatus[AttendanceStatus.SICK]?.size || 0;
    
    const allUniqueDays = new Set(studentRecords.map(r => r.date));

    return {
      absent,
      permission,
      sick,
      totalDays: allUniqueDays.size,
    };
  }, [studentRecords]);

  useEffect(() => {
    if (chartRef.current && studentRecords.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['غائب', 'إذن', 'مرض'],
            datasets: [{
              label: 'عدد أيام الغياب',
              data: [absenceSummary.absent, absenceSummary.permission, absenceSummary.sick],
              backgroundColor: [
                '#F43F5E', // rose-500
                '#F59E0B', // amber-500
                '#F97316', // orange-500
              ],
              borderColor: '#fff',
              borderWidth: 4,
              hoverOffset: 8,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: { family: "'Plus Jakarta Sans', sans-serif", size: 14, weight: '600' },
                  color: '#475569',
                  padding: 20,
                  boxWidth: 15,
                  usePointStyle: true,
                  pointStyle: 'circle'
                }
              },
              tooltip: {
                 bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
                 titleFont: { family: "'Plus Jakarta Sans', sans-serif" },
                 backgroundColor: '#1E293B',
                 titleColor: '#CBD5E1',
                 bodyColor: '#F1F5F9',
                 padding: 12,
                 cornerRadius: 8,
                 boxPadding: 4,
              }
            }
          }
        });
      }
    } else if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
    }

    return () => {
       if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
       }
    }
  }, [absenceSummary, studentRecords]);


  const exportToPDF = () => {
    if (!selectedStudent) return;
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.text(`Taqrir al-Talib: ${selectedStudent.name}`, 14, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`al-Fasl: ${selectedStudent.className}`, 14, 28);
    
    doc.autoTable({
      startY: 35,
      head: [['al-Tarik', 'al-Hala', 'al-Madda al-Dirasia']],
      body: studentRecords.map(r => [r.date, r.status, r.course || '-']),
      styles: { font: "helvetica", halign: 'center' },
      headStyles: { fillColor: [45, 55, 72] },
    });
    
    doc.save(`report_${selectedStudent.name.replace(/ /g, '_')}.pdf`);
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
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">التقرير الفردي للطالب</h1>
        <p className="text-center text-slate-500 mb-8">ابحث عن طالب لعرض سجل حضوره الكامل</p>
        
        <div className="mb-6 p-6 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">اختر الفصل</label>
                    <select onChange={e => { setSelectedClass(e.target.value as ClassName); setSelectedStudentId(''); setStudentSearchQuery(''); }} value={selectedClass} className={inputStyle}>
                    <option value="">-- اختر --</option>
                    {CLASS_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">اختر الطالب</label>
                    <input type="text" placeholder="ابحث بالاسم لتصفية القائمة..." value={studentSearchQuery} onChange={e => setStudentSearchQuery(e.target.value)} className={inputStyle} disabled={!selectedClass} />
                    <select onChange={e => setSelectedStudentId(e.target.value)} value={selectedStudentId} className={inputStyle} disabled={!selectedClass}>
                    <option value="">-- اختر --</option>
                    {classStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
        </div>


        {selectedStudent && (
             <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6 rounded-xl shadow-lg shadow-slate-800/20">
                <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-slate-300 font-medium">{selectedStudent.className}</p>
                </div>
                <button onClick={exportToPDF} className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-2.5 px-5 rounded-lg hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 transform hover:-translate-y-0.5">
                    <DocumentArrowDownIcon className="w-5 h-5"/>
                    <span>تصدير إلى PDF</span>
                </button>
            </div>
        )}

        {selectedStudent && studentRecords.length > 0 && (
          <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">ملخص الحضور</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative h-64 md:h-72 w-full max-w-sm mx-auto">
                 <canvas ref={chartRef}></canvas>
              </div>
              <div className="space-y-4">
                <div className="text-center md:text-right border-b-2 border-slate-200 pb-4">
                    <p className="text-lg text-slate-600 font-medium">إجمالي أيام الغياب</p>
                    <p className="font-extrabold text-5xl gradient-text">{absenceSummary.totalDays} <span className="text-3xl font-bold text-slate-800">يوم</span></p>
                </div>
                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-md text-slate-700 flex items-center justify-between p-2 rounded-md hover:bg-rose-50">
                    <span className="flex items-center"><span className="inline-block w-3 h-3 rounded-full ml-2 bg-[#F43F5E]"></span>غائب</span>
                    <span className="font-bold">{absenceSummary.absent} يوم</span>
                  </p>
                  <p className="font-semibold text-md text-slate-700 flex items-center justify-between p-2 rounded-md hover:bg-amber-50">
                    <span className="flex items-center"><span className="inline-block w-3 h-3 rounded-full ml-2 bg-[#F59E0B]"></span>إذن</span>
                    <span className="font-bold">{absenceSummary.permission} يوم</span>
                  </p>
                  <p className="font-semibold text-md text-slate-700 flex items-center justify-between p-2 rounded-md hover:bg-orange-50">
                    <span className="flex items-center"><span className="inline-block w-3 h-3 rounded-full ml-2 bg-[#F97316]"></span>مرض</span>
                    <span className="font-bold">{absenceSummary.sick} يوم</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-800">
              <tr>
                {['التاريخ', 'الحالة', 'المادة الدراسية'].map(header => (
                  <th key={header} className="py-3 px-6 text-right font-semibold text-white text-sm uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {selectedStudentId ? (
                studentRecords.length > 0 ? studentRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-slate-700 whitespace-nowrap">{record.date}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 whitespace-nowrap">{record.course || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="text-center py-16 text-slate-500">
                     <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                        <p className="font-bold text-lg">لا توجد سجلات غياب لهذا الطالب.</p>
                    </div>
                  </td></tr>
                )
              ) : (
                 <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z" /></svg>
                        <p className="font-bold text-lg">الرجاء اختيار طالب لعرض تقريره.</p>
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

export default StudentReportPage;