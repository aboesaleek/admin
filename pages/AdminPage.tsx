import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CLASS_NAMES } from '../constants';
import type { ClassName, Dormitory, UserRole } from '../types';
import { TrashIcon } from '../components/icons';

type OpMessage = {
  text: string;
  type: 'success' | 'error';
};

const AdminPage: React.FC = () => {
  const { 
    students, courses, dormitories, dormitoryStudents, managedUsers,
    addStudentsBulk, deleteStudent, addCoursesBulk, deleteCourse,
    addDormitoriesBulk, deleteDormitory, addDormitoryStudentsBulk, deleteDormitoryStudent,
    createNewUser, updateUserRole
  } = useData();
  const { user, signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'academic' | 'dormitory' | 'users'>('academic');

  // General Operation Message
  const [opMessage, setOpMessage] = useState<OpMessage | null>(null);

  useEffect(() => {
    if (opMessage) {
        const timer = setTimeout(() => setOpMessage(null), 4000);
        return () => clearTimeout(timer);
    }
  }, [opMessage]);

  // Academic State
  const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
  const [bulkStudentNames, setBulkStudentNames] = useState('');
  const [bulkCourseNames, setBulkCourseNames] = useState('');

  // Dormitory State
  const [selectedDormitoryId, setSelectedDormitoryId] = useState<string>('');
  const [bulkDormitoryNames, setBulkDormitoryNames] = useState('');
  const [bulkDormStudentNames, setBulkDormStudentNames] = useState('');

  // User Management State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('academic');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleAddStudents = async () => {
    if (!selectedClass || !bulkStudentNames.trim()) return;
    const names = bulkStudentNames.split('\n').filter(name => name.trim() !== '');
    try {
        await addStudentsBulk(names, selectedClass);
        setBulkStudentNames('');
        setOpMessage({ text: 'تمت إضافة الطلاب بنجاح!', type: 'success' });
    } catch (error) {
        setOpMessage({ text: 'فشل في إضافة الطلاب.', type: 'error' });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب وجميع سجلاته؟')) {
        try {
            await deleteStudent(studentId);
            setOpMessage({ text: 'تم حذف الطالب بنجاح.', type: 'success' });
        } catch (error) {
            setOpMessage({ text: 'فشل حذف الطالب.', type: 'error' });
        }
    }
  };

  const handleAddCourses = async () => {
    if (!bulkCourseNames.trim()) return;
    const names = bulkCourseNames.split('\n').filter(name => name.trim() !== '');
    try {
        await addCoursesBulk(names);
        setBulkCourseNames('');
        setOpMessage({ text: 'تمت إضافة المواد بنجاح!', type: 'success' });
    } catch (error) {
        setOpMessage({ text: 'فشل في إضافة المواد.', type: 'error' });
    }
  };

   const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
       try {
            await deleteCourse(courseId);
            setOpMessage({ text: 'تم حذف المادة بنجاح.', type: 'success' });
        } catch (error) {
            setOpMessage({ text: 'فشل حذف المادة.', type: 'error' });
        }
    }
  };

  const handleAddDormitories = async () => {
    if (!bulkDormitoryNames.trim()) return;
    const names = bulkDormitoryNames.split('\n').filter(name => name.trim() !== '');
     try {
        await addDormitoriesBulk(names);
        setBulkDormitoryNames('');
        setOpMessage({ text: 'تمت إضافة المهاجع بنجاح!', type: 'success' });
    } catch (error) {
        setOpMessage({ text: 'فشل في إضافة المهاجع.', type: 'error' });
    }
  };

  const handleDeleteDormitory = async (dormId: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا المهجع وجميع الطلاب والسجلات المرتبطة به؟')) {
          try {
              await deleteDormitory(dormId);
              setOpMessage({ text: 'تم حذف المهجع بنجاح.', type: 'success' });
          } catch(error) {
              setOpMessage({ text: 'فشل حذف المهجع.', type: 'error' });
          }
      }
  }

  const handleAddDormStudents = async () => {
    if (!selectedDormitoryId || !bulkDormStudentNames.trim()) return;
    const names = bulkDormStudentNames.split('\n').filter(name => name.trim() !== '');
    try {
        await addDormitoryStudentsBulk(names, selectedDormitoryId);
        setBulkDormStudentNames('');
        setOpMessage({ text: 'تمت إضافة طلاب السكن بنجاح!', type: 'success' });
    } catch (error) {
        setOpMessage({ text: 'فشل في إضافة طلاب السكن.', type: 'error' });
    }
  };

  const handleDeleteDormStudent = async (studentId: string) => {
      if (window.confirm('هل أنت متأكد من حذف طالب السكن هذا وجميع سجلاته؟')) {
          try {
              await deleteDormitoryStudent(studentId);
              setOpMessage({ text: 'تم حذف طالب السكن بنجاح.', type: 'success' });
          } catch(error) {
              setOpMessage({ text: 'فشل حذف طالب السكن.', type: 'error' });
          }
      }
  }
  
  const handleCreateUser = async () => {
    setOpMessage(null);
    if (!newUserEmail || !newUserPassword) {
      setOpMessage({ type: 'error', text: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' });
      return;
    }
    setIsCreatingUser(true);
    const { error } = await createNewUser({ email: newUserEmail, password: newUserPassword, role: newUserRole });
    if (error) {
      setOpMessage({ type: 'error', text: `فشل إنشاء المستخدم: ${error.message}` });
    } else {
      setOpMessage({ type: 'success', text: 'تم إنشاء المستخدم بنجاح! يمكنه الآن تسجيل الدخول مباشرة.' });
      setNewUserEmail('');
      setNewUserPassword('');
    }
    setIsCreatingUser(false);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
        await updateUserRole(userId, newRole);
        setOpMessage({ text: 'تم تحديث دور المستخدم بنجاح.', type: 'success' });
    } catch (error) {
        setOpMessage({ text: 'فشل تحديث دور المستخدم.', type: 'error' });
    }
  };

  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.className === selectedClass).sort((a,b) => a.name.localeCompare(b.name));
  }, [students, selectedClass]);
  
  const studentsInDormitory = useMemo(() => {
    if (!selectedDormitoryId) return [];
    return dormitoryStudents.filter(s => s.dormitoryId === selectedDormitoryId).sort((a,b) => a.name.localeCompare(b.name));
  }, [dormitoryStudents, selectedDormitoryId]);
  
  const cardStyle = "bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500 p-6";
  const inputStyle = "block w-full rounded-lg border-slate-300 bg-slate-100 py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all";
  const labelStyle = "block text-sm font-semibold text-slate-700 mb-2";
  const buttonStyle = "w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const tabBaseStyle = "px-6 py-3 font-bold rounded-t-lg transition-colors text-slate-600 border-b-2";
  const tabActiveStyle = "text-indigo-600 border-indigo-600 bg-indigo-50/50";
  const tabInactiveStyle = "border-transparent hover:text-indigo-500 hover:border-indigo-300";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-center text-slate-800 mb-2">الإدارة العامة</h1>
      <p className="text-center text-slate-500 mb-10">إدارة البيانات الأساسية والنظام من هنا</p>

       {opMessage && (
          <div className={`max-w-3xl mx-auto p-4 rounded-lg mb-6 text-center font-semibold ${opMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {opMessage.text}
          </div>
       )}

      <div className="mb-6 border-b border-slate-300 flex justify-center">
        <button onClick={() => setActiveTab('academic')} className={`${tabBaseStyle} ${activeTab === 'academic' ? tabActiveStyle : tabInactiveStyle}`}>
          إدارة الأكاديمية
        </button>
        <button onClick={() => setActiveTab('dormitory')} className={`${tabBaseStyle} ${activeTab === 'dormitory' ? tabActiveStyle : tabInactiveStyle}`}>
          إدارة السكن
        </button>
        <button onClick={() => setActiveTab('users')} className={`${tabBaseStyle} ${activeTab === 'users' ? tabActiveStyle : tabInactiveStyle}`}>
          إدارة المستخدمين
        </button>
      </div>

      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Academic Management UI */}
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
                  <textarea value={bulkStudentNames} onChange={e => setBulkStudentNames(e.target.value)} rows={5} className={inputStyle} placeholder='اسم الطالب الأول&#10;اسم الطالب الثاني&#10;اسم الطالب الثالث'></textarea>
                  <button onClick={handleAddStudents} className={`mt-3 ${buttonStyle}`}>إضافة الطلاب</button>
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-slate-700">طلاب الفصل ({studentsInClass.length})</h3>
                  <ul className="max-h-60 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
                    {studentsInClass.length > 0 ? studentsInClass.map(s => (
                      <li key={s.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-200/60 rounded-md transition-colors">
                        <span className="font-medium text-slate-800">{s.name}</span>
                        <button onClick={() => handleDeleteStudent(s.id)} className="text-slate-400 hover:text-rose-600 transition-colors"> <TrashIcon className="w-5 h-5" /> </button>
                      </li>
                    )) : <li className="text-center text-slate-500 p-4">لا يوجد طلاب في هذا الفصل.</li>}
                  </ul>
                </div>
              </>
            )}
          </div>

          <div className={cardStyle}>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">إدارة المواد الدراسية</h2>
            <div className="mb-4">
              <label className={labelStyle}>إضافة مواد دراسية جديدة (اسم واحد في كل سطر)</label>
              <textarea value={bulkCourseNames} onChange={e => setBulkCourseNames(e.target.value)} rows={5} className={inputStyle} placeholder='القرآن الكريم&#10;الحديث الشريف&#10;الفقه'></textarea>
              <button onClick={handleAddCourses} className={`mt-3 ${buttonStyle}`}>إضافة المواد</button>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-slate-700">المواد الدراسية الحالية ({courses.length})</h3>
              <ul className="max-h-96 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
                {courses.length > 0 ? courses.map(c => (
                  <li key={c.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-200/60 rounded-md transition-colors">
                    <span className="font-medium text-slate-800">{c.name}</span>
                    <button onClick={() => handleDeleteCourse(c.id)} className="text-slate-400 hover:text-rose-600 transition-colors"> <TrashIcon className="w-5 h-5" /> </button>
                  </li>
                )) : <li className="text-center text-slate-500 p-4">لا توجد مواد دراسية.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dormitory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Dormitory Management UI */}
          <div className={cardStyle}>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">إدارة المهاجع (السكن)</h2>
            <div className="mb-4">
              <label className={labelStyle}>إضافة مهاجع جديدة (اسم واحد في كل سطر)</label>
              <textarea value={bulkDormitoryNames} onChange={e => setBulkDormitoryNames(e.target.value)} rows={3} className={inputStyle} placeholder="مهجع ١&#10;مهجع ٢"></textarea>
              <button onClick={handleAddDormitories} className={`mt-3 ${buttonStyle}`}>إضافة المهاجع</button>
            </div>
             <div>
                <h3 className="font-bold mb-2 text-slate-700">المهاجع الحالية ({dormitories.length})</h3>
                <ul className="max-h-60 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
                  {dormitories.length > 0 ? dormitories.map(d => (
                    <li key={d.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-200/60 rounded-md transition-colors">
                      <span className="font-medium text-slate-800">{d.name}</span>
                      <button onClick={() => handleDeleteDormitory(d.id)} className="text-slate-400 hover:text-rose-600 transition-colors"> <TrashIcon className="w-5 h-5" /> </button>
                    </li>
                  )) : <li className="text-center text-slate-500 p-4">لا توجد مهاجع معرفة.</li>}
                </ul>
              </div>
          </div>

          <div className={cardStyle}>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">إدارة طلاب السكن</h2>
            <div className="mb-4">
              <label className={labelStyle}>اختر المهجع</label>
              <select value={selectedDormitoryId} onChange={e => setSelectedDormitoryId(e.target.value)} className={inputStyle}>
                <option value="" disabled>-- اختر لإضافة أو عرض الطلاب --</option>
                {dormitories.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {selectedDormitoryId && (
              <>
                <div className="mb-4">
                  <label className={labelStyle}>إضافة طلاب جدد للمهجع (اسم واحد في كل سطر)</label>
                  <textarea value={bulkDormStudentNames} onChange={e => setBulkDormStudentNames(e.target.value)} rows={5} className={inputStyle} placeholder="اسم الطالب الأول&#10;اسم الطالب الثاني"></textarea>
                  <button onClick={handleAddDormStudents} className={`mt-3 ${buttonStyle}`}>إضافة الطلاب للمهجع</button>
                </div>
                 <div>
                  <h3 className="font-bold mb-2 text-slate-700">طلاب المهجع ({studentsInDormitory.length})</h3>
                  <ul className="max-h-60 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
                    {studentsInDormitory.map(s => (
                       <li key={s.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-200/60 rounded-md transition-colors">
                        <span className="font-medium text-slate-800">{s.name}</span>
                        <button onClick={() => handleDeleteDormStudent(s.id)} className="text-slate-400 hover:text-rose-600 transition-colors"> <TrashIcon className="w-5 h-5" /> </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* User Management UI */}
          <div className={cardStyle}>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">إضافة مستخدم جديد</h2>
            <div className="space-y-4">
              <div>
                <label className={labelStyle}>البريد الإلكتروني</label>
                <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className={inputStyle} placeholder="user@example.com" />
              </div>
              <div>
                <label className={labelStyle}>كلمة المرور</label>
                <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className={inputStyle} placeholder="••••••••" />
              </div>
              <div>
                <label className={labelStyle}>الدور</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} className={inputStyle}>
                  <option value="academic">مدير أكاديمي</option>
                  <option value="dormitory">مدير سكني</option>
                  <option value="admin">مدير عام</option>
                </select>
              </div>
              <button onClick={handleCreateUser} disabled={isCreatingUser} className={buttonStyle}>
                {isCreatingUser ? 'جاري الإنشاء...' : 'إنشاء مستخدم'}
              </button>
            </div>
          </div>
          <div className={cardStyle}>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">المستخدمون الحاليون</h2>
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
              {managedUsers.filter(u => u.id !== user?.id).map(managedUser => (
                <div key={managedUser.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 px-3 hover:bg-slate-200/60 rounded-md transition-colors gap-2">
                  <span className="font-medium text-slate-800 truncate">{managedUser.email}</span>
                  <select 
                    value={managedUser.role} 
                    onChange={e => handleRoleChange(managedUser.id, e.target.value as UserRole)}
                    className="rounded-md border-slate-300 bg-white py-1 px-2 text-sm text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="admin">مدير عام</option>
                    <option value="academic">مدير أكاديمي</option>
                    <option value="dormitory">مدير سكني</option>
                  </select>
                </div>
              ))}
            </div>
             <p className="text-xs text-slate-500 mt-4 text-center">
                لحذف مستخدم، يرجى القيام بذلك من خلال لوحة تحكم Supabase لضمان حذف جميع البيانات المرتبطة به بشكل آمن.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
