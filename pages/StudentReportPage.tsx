import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_NAMES } from '../constants';
import type { ClassName } from '../types';
import { AttendanceStatus } from '../types';
import { UserCircleIcon } from '../components/icons';

const StudentReportPage: React.FC = () => {
    const { students, records } = useData();
    const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null); // To hold the chart instance

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

    const summary = useMemo(() => {
        const stats = {
            [AttendanceStatus.ABSENT]: 0,
            [AttendanceStatus.PERMISSION]: 0,
            [AttendanceStatus.SICK]: 0,
        };
        studentRecords.forEach(record => {
            if (record.status in stats) {
                stats[record.status]++;
            }
        });
        return stats;
    }, [studentRecords]);

    useEffect(() => {
        if (selectedStudent && chartRef.current) {
            // Destroy previous chart instance if it exists
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
                            data: [summary[AttendanceStatus.ABSENT], summary[AttendanceStatus.PERMISSION], summary[AttendanceStatus.SICK]],
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
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    font: {
                                        family: "'Plus Jakarta Sans', 'Tajawal', sans-serif",
                                        size: 14,
                                    },
                                    color: '#334155', // slate-700
                                }
                            },
                            tooltip: {
                                titleFont: {
                                    family: "'Plus Jakarta Sans', 'Tajawal', sans-serif",
                                },
                                bodyFont: {
                                     family: "'Plus Jakarta Sans', 'Tajawal', sans-serif",
                                }
                            }
                        }
                    }
                });
            }
        }
        
        // Cleanup function
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

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-8">
                <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">التقرير الفردي للطالب</h1>
                <p className="text-center text-slate-500 mb-8">اختر طالباً لعرض تقرير الحضور الخاص به</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-slate-50/70 rounded-xl border border-slate-200/80">
                    <div>
                        <label htmlFor="class" className={labelStyle}>اختر الفصل</label>
                        <select id="class" value={selectedClass} onChange={e => { setSelectedClass(e.target.value as ClassName); setSelectedStudentId(''); }} className={inputStyle}>
                            <option value="" disabled>-- اختر الفصل --</option>
                            {CLASS_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="student" className={labelStyle}>اختر الطالب</label>
                        <select id="student" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className={inputStyle} disabled={!selectedClass}>
                            <option value="" disabled>-- اختر الطالب --</option>
                            {filteredStudents.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
                        </select>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                           <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-lg shadow-md shadow-rose-500/10 text-center">
                                <p className="text-3xl font-extrabold text-rose-600">{summary[AttendanceStatus.ABSENT]}</p>
                                <p className="text-sm font-semibold text-rose-800">أيام الغياب</p>
                           </div>
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-lg shadow-md shadow-amber-500/10 text-center">
                                <p className="text-3xl font-extrabold text-amber-600">{summary[AttendanceStatus.PERMISSION]}</p>
                                <p className="text-sm font-semibold text-amber-800">أيام الإذن</p>
                           </div>
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-lg shadow-md shadow-orange-500/10 text-center">
                                <p className="text-3xl font-extrabold text-orange-600">{summary[AttendanceStatus.SICK]}</p>
                                <p className="text-sm font-semibold text-orange-800">أيام المرض</p>
                           </div>
                        </div>
                        
                        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">الرسم البياني للحالات</h3>
                             <div className="relative h-64 md:h-80">
                                <canvas ref={chartRef}></canvas>
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {studentRecords.length > 0 ? studentRecords.map(record => (
                                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 text-slate-700">{record.date}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusBadge(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-700">{record.course || '-'}</td>
                                            <td className="py-4 px-6 text-slate-600">{record.type === 'attendance' ? 'حضور' : 'إذن'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-slate-500">لا توجد سجلات لهذا الطالب.</td>
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
                            <p className="text-base">اختر فصلاً ثم طالباً من القوائم أعلاه لعرض تقريره.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentReportPage;
