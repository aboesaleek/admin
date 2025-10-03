import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import type { Dormitory, DormitoryStudent } from '../../types';

const DormitoryPermissionPage: React.FC = () => {
  const { dormitories, dormitoryStudents, dormitoryPermissions, addDormitoryPermissionRecord } = useData();
  const [selectedDormitoryId, setSelectedDormitoryId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const studentsInDormitory = useMemo(() => {
    if (!selectedDormitoryId) return [];
    return dormitoryStudents.filter(s => s.dormitoryId === selectedDormitoryId).sort((a,b) => a.name.localeCompare(b.name));
  }, [selectedDormitoryId, dormitoryStudents]);
  
  const todaysPermissions = useMemo(() => {
      return dormitoryPermissions.filter(p => p.date === date);
  }, [date, dormitoryPermissions]);

  const studentsWithPermissionTodayIds = useMemo(() => new Set(todaysPermissions.map(p => p.studentId)), [todaysPermissions]);
  
  const availableStudents = useMemo(() => {
      return studentsInDormitory.filter(s => !studentsWithPermissionTodayIds.has(s.id));
  }, [studentsInDormitory, studentsWithPermissionTodayIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!selectedStudentId || !date) {
      setMessage({ text: 'الرجاء تعبئة جميع الحقول المطلوبة', type: 'error' });
      return;
    }
    try {
        await addDormitoryPermissionRecord(selectedStudentId, date, description);
        setMessage({ text: 'تم تسجيل طلب الإذن بنجاح!', type: 'success' });
        setSelectedStudentId('');
        setDescription('');
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
           <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-emerald-500 p-6 sticky top-28">
                <h2 className="text-xl font-bold text-slate-800 mb-4">الأذونات المسجلة لليوم</h2>
                {todaysPermissions.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {todaysPermissions.map(p => (
                            <li key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="font-bold text-slate-800">{p.studentName}</p>
                                <p className="text-sm text-slate-500">{p.dormitoryName}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 py-8">لا توجد أذونات مسجلة لهذا اليوم.</p>
                )}
           </div>
        </div>
        <div className="lg:col-span-2">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-8">
                <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">تسجيل إذن خروج</h1>
                <p className="text-center text-slate-500 mb-8">قم بتسجيل إذن الخروج للطالب المحدد</p>
                
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
                <div>
                    <label htmlFor="dormitory" className={labelStyle}>اختر المهجع (السكن)</label>
                    <select id="dormitory" value={selectedDormitoryId} onChange={(e) => { setSelectedDormitoryId(e.target.value); setSelectedStudentId(''); }} className={inputStyle} required>
                    <option value="" disabled>-- اختر المهجع --</option>
                    {dormitories.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                {selectedDormitoryId && (
                    <div>
                    <label htmlFor="student" className={labelStyle}>اختر الطالب</label>
                    <select id="student" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className={inputStyle} required>
                        <option value="" disabled>-- اختر الطالب --</option>
                        {availableStudents.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
                    </select>
                    {availableStudents.length === 0 && studentsInDormitory.length > 0 && <p className="text-sm text-amber-600 mt-2">جميع طلاب هذا المهجع لديهم إذن اليوم.</p>}
                    </div>
                )}
                
                <div>
                    <label htmlFor="description" className={labelStyle}>البيان (اختياري)</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputStyle} placeholder='مثال: الخروج لشراء احتياجات شخصية...'></textarea>
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
      </div>
    </div>
  );
};

export default DormitoryPermissionPage;