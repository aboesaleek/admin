import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { CLASS_NAMES } from '../constants';
import type { ClassName } from '../types';
import { TrashIcon } from '../components/icons';

const AdminPage: React.FC = () => {
  const { students, courses, addStudentsBulk, deleteStudent, addCourse, deleteCourse } = useData();
  const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
  const [bulkStudentNames, setBulkStudentNames] = useState('');
  const [newCourseName, setNewCourseName] = useState('');

  const handleAddStudents = () => {
    if (!selectedClass || !bulkStudentNames.trim()) return;
    const names = bulkStudentNames.split('\n').filter(name => name.trim() !== '');
    addStudentsBulk(names, selectedClass);
    setBulkStudentNames('');
  };

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;
    addCourse(newCourseName);
    setNewCourseName('');
  };

  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.className === selectedClass).sort((a,b) => a.name.localeCompare(b.name));
  }, [students, selectedClass]);
  
  const cardStyle = "bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-6";
  const inputStyle = "block w-full rounded-lg border-slate-300 bg-slate-100 py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all";
  const labelStyle = "block text-sm font-semibold text-slate-700 mb-2";
  const buttonStyle = "w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-center text-slate-800 mb-2">لوحة تحكم المسؤول</h1>
      <p className="text-center text-slate-500 mb-10">إدارة البيانات الأساسية للنظام من هنا</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Student Management */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">إدارة بيانات الطلاب</h2>
          <div className="mb-4">
            <label className={labelStyle}>اختر الفصل</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value as ClassName)} className={inputStyle}>
                <option value="" disabled>-- اختر لإضافة أو عرض الطلاب --</option>
                {CLASS_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {selectedClass && (
            <>
              <div className="mb-4">
                <label className={labelStyle}>إضافة طلاب جدد (اسم واحد في كل سطر)</label>
                <textarea value={bulkStudentNames} onChange={e => setBulkStudentNames(e.target.value)} rows={5} className={inputStyle}></textarea>
                <button onClick={handleAddStudents} className={`mt-3 ${buttonStyle}`}>إضافة الطلاب</button>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-slate-700">طلاب الفصل ({studentsInClass.length})</h3>
                <ul className="max-h-60 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
                  {studentsInClass.length > 0 ? studentsInClass.map(s => (
                    <li key={s.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-200/60 rounded-md transition-colors">
                      <span className="font-medium text-slate-800">{s.name}</span>
                      <button onClick={() => deleteStudent(s.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </li>
                  )) : <li className="text-center text-slate-500 p-4">لا يوجد طلاب في هذا الفصل.</li>}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Course Management */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">إدارة المواد الدراسية</h2>
          <div className="mb-4">
            <label className={labelStyle}>إضافة مادة دراسية جديدة</label>
            <div className="flex gap-2">
              <input type="text" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} className={`${inputStyle} flex-grow`} />
              <button onClick={handleAddCourse} className={`shrink-0 ${buttonStyle} w-auto`}>إضافة</button>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-slate-700">المواد الدراسية الحالية ({courses.length})</h3>
            <ul className="max-h-96 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
              {courses.length > 0 ? courses.map(c => (
                <li key={c.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-200/60 rounded-md transition-colors">
                  <span className="font-medium text-slate-800">{c.name}</span>
                  <button onClick={() => deleteCourse(c.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </li>
              )) : <li className="text-center text-slate-500 p-4">لا توجد مواد دراسية.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;