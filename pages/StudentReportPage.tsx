import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_NAMES } from '../constants';
import type { ClassName, Student } from '../types';
import { AttendanceStatus } from '../types';
import { UserCircleIcon, TrashIcon } from '../components/icons';

type ToastMessage = {
  text: string;
  type: 'success' | 'error';
};

const StudentReportPage: React.FC = () => {
    const { students, records, deleteRecord } = useData();
    const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);

    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        return students.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, students]);

    const handleSelectStudent = (student: Student) => {
        setSelectedClass(student.className);
        setSelectedStudentId(student.id);
        setSearchQuery('');
    };

    const filteredStudents = useMemo(() => {
        if (!selectedClass) return [];
        return students.filter(s => s.className === selectedClass).sort((a,b) => a.name.localeCompare(b.name));
    }, [selectedClass, students]);

    const selectedStudent = useMemo(() => {
        return students.find(s => s.id === selectedStudentId);
    }, [selectedStudentId, students]);

    const studentRecords = useMemo(() => {
        if (!selectedStudentId) return [];
        return records.filter(r => r.studentId === selectedStudentId).sort((a,b) => b.date.localeCompare(a.date));
    }, [selectedStudentId, records]);
    
    const handleDeleteRecord = async (recordId: string, studentName: string) => {
      if (window.confirm(`هل أنت متأكد من حذف هذا السجل للطالب ${studentName}؟`)) {
          try {
            await deleteRecord(recordId);
            setToastMessage({ text: 'تم حذف السجل بنجاح.', type: 'success' });
          } catch(error) {
            setToastMessage({ text: 'فشل حذف السجل.', type: 'error' });
          } finally {
            setTimeout(() => {
                setToastMessage(null);
            }, 3000);
          }
      }
    };

    const summary = useMemo(() => {
        const stats = {
            [AttendanceStatus.ABSENT]: { count: 0, dates: [] as {id: string, date: string}[] },
            [AttendanceStatus.PERMISSION]: { count: 0, dates: [] as {id: string, date: string}[] },
            [AttendanceStatus.SICK]: { count: 0, dates: [] as {id: string, date: string}[] },
        };
        studentRecords.forEach(record => {
            if (record.status in stats) {
                stats[record.status].count++;
                stats[record.status].dates.push({id: record.id, date: record.date});
            }
        });
        return stats;
    }, [studentRecords]);
    
    const totalDaysAbsent = useMemo(() => {
        if (!studentRecords.length) return 0;
        const uniqueDates = new Set(studentRecords.map(r => r.date));
        return uniqueDates.size;
    }, [studentRecords]);

    useEffect(() => {
        if (selectedStudent && chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                const { Chart } = (window as any);
                chartInstance.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['غائب', 'إذن', 'مرض'],
                        datasets: [{
                            label: 'ملخص الحضور',
                            data: [summary[AttendanceStatus.ABSENT].count, summary[AttendanceStatus.PERMISSION].count, summary[AttendanceStatus.SICK].count],
                            backgroundColor: [
                                'rgba(239, 68, 68, 0.7)',
                                'rgba(245, 158, 11, 0.7)',
                                'rgba(249, 115, 22, 0.7)',
                            ],
                            borderColor: [
                                'rgba(239, 68, 68, 1)',
                                'rgba(245, 158, 11, 1)',
                                'rgba(249, 115, 22, 1)',
                            ],
                            borderWidth: 1
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
                                    font: {
                                        family: "'Plus Jakarta Sans', 'Tajawal', sans-serif",
                                        size: 14,
                                    },
                                    color: '#334155', // slate-700
                                }
                            },
                            tooltip: {
                                titleFont: { family: "'Plus Jakarta Sans', 'Tajawal', sans-serif" },
                                bodyFont: { family: "'Plus Jakarta Sans', 'Tajawal', sans-serif" }
                            }
                        }
                    }
                });
            }
        }
        
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [selectedStudent, summary]);

    
    const inputStyle = "block w-full rounded-lg border-slate-300 bg-white py-3 px-4 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all";
    const labelStyle = "block text-sm font-semibold text-slate-700 mb-2";
    const statusBadge = (status: string) => {
      switch(status) {
          case 'غائب': return 'bg-rose-100 text-rose-700 border border-rose-200';
          case 'إذن': return 'bg-amber-100 text-amber-700 border border-amber-200';
          case 'مرض': return 'bg-orange-100 text-orange-700 border border-orange-200';
          default: return 'bg-slate-100 text-slate-700 border border-slate-200';
      }
    }
    
    const SummaryCard: React.FC<{ title: string, count: number, dates: {id: string, date: string}[], color: string }> = ({ title, count, dates, color }) => {
        const colors = {
            red: { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-600', textMuted: 'text-rose-800', shadow: 'shadow-rose-500/10' },
            amber: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-600', textMuted: 'text-amber-800', shadow: 'shadow-amber-500/10' },
            orange: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-600', textMuted: 'text-orange-800', shadow: 'shadow-orange-500/10' }
        };
        const c = colors[color as keyof typeof colors];

        return (
            <div className={`${c.bg} border-l-4 ${c.border} p-5 rounded-lg shadow-md ${c.shadow}`}>
                <div className="flex justify-between items-center">
                    <p className={`text-3xl font-extrabold ${c.text}`}>{count}</p>
                    <p className={`text-sm font-semibold ${c.textMuted}`}>{title}</p>
                </div>
                {dates.length > 0 && <hr className={`my-2 ${c.border} opacity-30`} />}
                <div className="space-y-1 text-xs text-slate-600 font-mono text-left max-h-24 overflow-y-auto" dir="ltr">
                    {dates.map(d => <div key={d.id}>{d.date}</div>)}
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            {toastMessage && (
                <div 
                    className={`fixed bottom-8 right-8 z-50 bg-slate-900 text-white py-3 px-6 rounded-lg shadow-2xl animate-fade-in-up flex items-center gap-3`} 
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
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-8">
                <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">التقرير الفردي للطالب</h1>
                <p className="text-center text-slate-500 mb-8">ابحث عن طالب أو اختره لعرض تقرير الحضور الخاص به</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50/70 rounded-xl border border-slate-200/80">
                    <div className="md:col-span-1 relative">
                        <label htmlFor="search" className={labelStyle}>بحث سريع عن طالب</label>
                        <input
                            type="text"
                            id="search"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="اكتب اسم الطالب..."
                            className={inputStyle}
                        />
                         {searchQuery && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {searchResults.length > 0 ? searchResults.map(student => (
                                    <li key={student.id} onClick={() => handleSelectStudent(student)} className="px-4 py-2 cursor-pointer hover:bg-indigo-50">
                                        {student.name} <span className="text-sm text-slate-500">({student.className})</span>
                                    </li>
                                )) : <li className="px-4 py-2 text-slate-500">لم يتم العثور على الطالب</li>}
                            </ul>
                        )}
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="class" className={labelStyle}>الفصل المحدد</label>
                            <select id="class" value={selectedClass} onChange={e => { setSelectedClass(e.target.value as ClassName); setSelectedStudentId(''); }} className={inputStyle}>
                                <option value="" disabled>-- اختر الفصل --</option>
                                {CLASS_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="student" className={labelStyle}>الطالب المحدد</label>
                            <select id="student" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className={inputStyle} disabled={!selectedClass}>
                                <option value="" disabled>-- اختر الطالب --</option>
                                {filteredStudents.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {selectedStudent ? (
                    <div className="mt-8 animate-fade-in">
                         <div className="glass-card p-6 rounded-xl mb-8 border border-slate-200">
                           <div className="flex items-center">
                                <UserCircleIcon className="w-16 h-16 text-indigo-500 ml-5" />
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800">{selectedStudent.name}</h2>
                                    <p className="text-slate-600 font-medium text-lg">{selectedStudent.className}</p>
                                </div>
                           </div>
                         </div>
                        
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">ملخص الحضور</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                           <div className="space-y-4">
                               <SummaryCard title="أيام الغياب" count={summary[AttendanceStatus.ABSENT].count} dates={summary[AttendanceStatus.ABSENT].dates} color="red"/>
                               <SummaryCard title="أيام الإذن" count={summary[AttendanceStatus.PERMISSION].count} dates={summary[AttendanceStatus.PERMISSION].dates} color="amber"/>
                               <SummaryCard title="أيام المرض" count={summary[AttendanceStatus.SICK].count} dates={summary[AttendanceStatus.SICK].dates} color="orange"/>
                           </div>
                           <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                               <div className="relative h-64 w-64 md:h-72 md:w-72">
                                  <canvas ref={chartRef}></canvas>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                      <span className="text-5xl font-extrabold text-slate-700">{totalDaysAbsent}</span>
                                      <span className="text-sm font-semibold text-slate-500">أيام</span>
                                  </div>
                              </div>
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-800 mb-4">السجلات التفصيلية</h3>
                        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                            <table className="min-w-full bg-white">
                                <thead className="bg-slate-800">
                                    <tr>
                                        {['التاريخ', 'الحالة', 'المادة الدراسية', 'النوع'].map(header => (
                                            <th key={header} className="py-3 px-6 text-right font-semibold text-white text-sm uppercase tracking-wider">{header}</th>
                                        ))}
                                        <th className="py-3 px-6 text-center font-semibold text-white text-sm uppercase tracking-wider">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {studentRecords.length > 0 ? studentRecords.map(record => (
                                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 text-slate-700 whitespace-nowrap">{record.date}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusBadge(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-700 whitespace-nowrap">{record.course || '-'}</td>
                                            <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{record.type === 'attendance' ? 'حضور' : 'إذن'}</td>
                                            <td className="py-4 px-6 text-center">
                                                <button 
                                                  onClick={() => handleDeleteRecord(record.id, record.studentName)}
                                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-full hover:bg-rose-100"
                                                  aria-label={`حذف سجل ${record.studentName} بتاريخ ${record.date}`}
                                                >
                                                  <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-10 text-slate-500">لا توجد سجلات لهذا الطالب.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 text-slate-500 bg-slate-50/70 rounded-xl border-2 border-dashed border-slate-300">
                         <div className="flex flex-col items-center">
                            <svg className="w-20 h-20 text-slate-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                            <p className="font-bold text-xl">الرجاء اختيار طالب</p>
                            <p className="text-base">ابحث عن اسم الطالب أو اختر فصلاً ثم طالباً لعرض تقريره.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentReportPage;