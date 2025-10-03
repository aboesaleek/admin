import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Student, Course, Record, ClassName, Dormitory, DormitoryStudent, DormitoryPermissionRecord, Profile, UserRole } from '../types';
import { AttendanceStatus } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  students: Student[];
  courses: Course[];
  records: Record[];
  dormitories: Dormitory[];
  dormitoryStudents: DormitoryStudent[];
  dormitoryPermissions: DormitoryPermissionRecord[];
  managedUsers: Profile[];
  addStudent: (name: string, className: ClassName) => Promise<void>;
  addStudentsBulk: (names: string[], className: ClassName) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addCourse: (name: string) => Promise<void>;
  addCoursesBulk: (names: string[]) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addPermissionRecord: (studentId: string, date: string, status: AttendanceStatus.PERMISSION | AttendanceStatus.SICK) => Promise<void>;
  addAttendanceRecords: (classRecords: { studentId: string; status: AttendanceStatus }[], date: string, course: string, className: ClassName) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  addDormitoriesBulk: (names: string[]) => Promise<void>;
  deleteDormitory: (dormitoryId: string) => Promise<void>;
  addDormitoryStudentsBulk: (names: string[], dormitoryId: string) => Promise<void>;
  deleteDormitoryStudent: (studentId: string) => Promise<void>;
  addDormitoryPermissionRecord: (studentId: string, date: string, description?: string) => Promise<void>;
  deleteDormitoryPermissionRecord: (recordId: string) => Promise<void>;
  createNewUser: (params: { email: string, password: string, role: UserRole }) => Promise<{ error: Error | null }>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth(); // Get session to re-login admin
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [dormitoryStudents, setDormitoryStudents] = useState<DormitoryStudent[]>([]);
  const [dormitoryPermissions, setDormitoryPermissions] = useState<DormitoryPermissionRecord[]>([]);
  const [managedUsers, setManagedUsers] = useState<Profile[]>([]);

  const fetchAllData = useCallback(async () => {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').order('name');
      if (studentsError) console.error('Error fetching students:', studentsError.message);
      else setStudents(studentsData || []);

      const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*').order('name');
      if (coursesError) console.error('Error fetching courses:', coursesError.message);
      else setCourses(coursesData || []);
      
      const { data: recordsData, error: recordsError } = await supabase.from('records').select('*').order('date', { ascending: false });
      if (recordsError) console.error('Error fetching records:', recordsError.message);
      else setRecords(recordsData || []);
        
      const { data: dormitoriesData, error: dormitoriesError } = await supabase.from('dormitories').select('*').order('name');
      if (dormitoriesError) console.error('Error fetching dormitories:', dormitoriesError.message);
      else setDormitories(dormitoriesData || []);
        
      const { data: dormStudentsData, error: dormStudentsError } = await supabase.from('dormitory_students').select('*').order('name');
      if (dormStudentsError) console.error('Error fetching dormitory students:', dormStudentsError.message);
      else setDormitoryStudents(dormStudentsData || []);

      const { data: dormPermissionsData, error: dormPermissionsError } = await supabase.from('dormitory_permissions').select('*').order('date', { ascending: false });
      if (dormPermissionsError) console.error('Error fetching dormitory permissions:', dormPermissionsError.message);
      else setDormitoryPermissions(dormPermissionsData || []);
      
      const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*').order('email');
      if (profilesError) console.error('Error fetching profiles:', profilesError.message);
      else setManagedUsers(profilesData || []);
  }, []);


  useEffect(() => {
    fetchAllData();

    const channel = supabase.channel('db-changes');
    channel
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          console.log('Change received!', payload);
          fetchAllData();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [fetchAllData]);
  
  const addStudent = useCallback(async (name: string, className: ClassName) => {
    const { error } = await supabase.from('students').insert({ name, className });
    if (error) {
        console.error('Error adding student:', error.message);
        throw error;
    }
  }, []);
  
  const addStudentsBulk = useCallback(async (names: string[], className: ClassName) => {
    const newStudents = names.map(name => ({ name: name.trim(), className }));
    if (newStudents.length > 0) {
        const { error } = await supabase.from('students').insert(newStudents);
        if (error) {
            console.error('Error adding students in bulk:', error.message);
            throw error;
        }
    }
  }, []);

  const deleteStudent = useCallback(async (studentId: string) => {
    await supabase.from('records').delete().eq('studentId', studentId);
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) {
        console.error('Error deleting student:', error.message);
        throw error;
    }
  }, []);

  const addCourse = useCallback(async (name: string) => {
    const { error } = await supabase.from('courses').insert({ name });
    if (error) {
        console.error('Error adding course:', error.message);
        throw error;
    }
  }, []);
  
  const addCoursesBulk = useCallback(async (names: string[]) => {
    const newCourses = names.map(name => ({ name: name.trim() })).filter(c => c.name);
    if (newCourses.length > 0) {
        const { error } = await supabase.from('courses').insert(newCourses);
        if (error) {
            console.error('Error adding courses in bulk:', error.message);
            throw error;
        }
    }
  }, []);

  const deleteCourse = useCallback(async (courseId: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) {
        console.error('Error deleting course:', error.message);
        throw error;
    }
  }, []);

  const addPermissionRecord = useCallback(async (studentId: string, date: string, status: AttendanceStatus.PERMISSION | AttendanceStatus.SICK) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const newRecord = { date, studentId, studentName: student.name, className: student.className, status, type: 'permission' as const };
    const { error } = await supabase.from('records').insert(newRecord);
    if (error) {
        console.error('Error adding permission record:', error.message);
        throw error;
    }
  }, [students]);

  const addAttendanceRecords = useCallback(async (classRecords: { studentId: string; status: AttendanceStatus }[], date: string, course: string, className: ClassName) => {
    const newRecords = classRecords.map(({ studentId, status }) => {
      const student = students.find(s => s.id === studentId);
      return { date, studentId, studentName: student?.name || 'Unknown', className, status, course, type: 'attendance' as const };
    });
    if (newRecords.length > 0) {
        const { error } = await supabase.from('records').insert(newRecords);
        if (error) {
            console.error('Error adding attendance records:', error.message);
            throw error;
        }
    }
  }, [students]);

  const deleteRecord = useCallback(async (recordId: string) => {
    const { error } = await supabase.from('records').delete().eq('id', recordId);
    if (error) {
        console.error('Error deleting record:', error.message);
        throw error;
    }
  }, []);

  // Dormitory Functions
  const addDormitoriesBulk = useCallback(async (names: string[]) => {
    const newDormitories = names.map(name => ({ name: name.trim() })).filter(d => d.name);
    if (newDormitories.length > 0) {
      const { error } = await supabase.from('dormitories').insert(newDormitories);
      if (error) {
        console.error('Error adding dormitories:', error.message);
        throw error;
      }
    }
  }, []);

  const deleteDormitory = useCallback(async (dormitoryId: string) => {
    await supabase.from('dormitory_permissions').delete().eq('dormitoryId', dormitoryId);
    await supabase.from('dormitory_students').delete().eq('dormitoryId', dormitoryId);
    const { error } = await supabase.from('dormitories').delete().eq('id', dormitoryId);
    if (error) {
        console.error('Error deleting dormitory:', error.message);
        throw error;
    }
  }, []);
    
  const addDormitoryStudentsBulk = useCallback(async (names: string[], dormitoryId: string) => {
    const newStudents = names.map(name => ({ name: name.trim(), dormitoryId }));
    if (newStudents.length > 0) {
        const { error } = await supabase.from('dormitory_students').insert(newStudents);
        if (error) {
            console.error('Error adding dormitory students in bulk:', error.message);
            throw error;
        }
    }
  }, []);

  const deleteDormitoryStudent = useCallback(async (studentId: string) => {
    await supabase.from('dormitory_permissions').delete().eq('studentId', studentId);
    const { error } = await supabase.from('dormitory_students').delete().eq('id', studentId);
    if (error) {
        console.error('Error deleting dormitory student:', error.message);
        throw error;
    }
  }, []);
    
  const addDormitoryPermissionRecord = useCallback(async (studentId: string, date: string, description?: string) => {
    const student = dormitoryStudents.find(s => s.id === studentId);
    const dormitory = dormitories.find(d => d.id === student?.dormitoryId);
    if (!student || !dormitory) return;
    const newRecord = { date, studentId, studentName: student.name, dormitoryId: dormitory.id, dormitoryName: dormitory.name, description };
    const { error } = await supabase.from('dormitory_permissions').insert(newRecord);
    if (error) {
        console.error('Error adding dormitory permission:', error.message);
        throw error;
    }
  }, [dormitoryStudents, dormitories]);

  const deleteDormitoryPermissionRecord = useCallback(async (recordId: string) => {
    const { error } = await supabase.from('dormitory_permissions').delete().eq('id', recordId);
    if (error) {
        console.error('Error deleting dormitory permission:', error.message);
        throw error;
    }
  }, []);

  // User Management Functions
  const createNewUser = useCallback(async ({ email, password, role }: { email: string, password: string, role: UserRole }) => {
    const currentAdmin = session?.user;
    if (!currentAdmin) return { error: new Error("Admin not logged in") };

    // Sign up a new user.
    // NOTE: For users to log in immediately without email confirmation,
    // the "Confirm email" setting must be disabled in the Supabase project's Auth settings.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role, // Pass role to be handled by a trigger
        },
      },
    });

    return { error };
  }, [session]);

  const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
        console.error('Error updating user role:', error.message);
        throw error;
    }
  }, []);


  return (
    <DataContext.Provider value={{
      students, courses, records, dormitories, dormitoryStudents, dormitoryPermissions, managedUsers,
      addStudent, deleteStudent, addCourse, deleteCourse, addPermissionRecord, addAttendanceRecords, addStudentsBulk, deleteRecord, addCoursesBulk,
      addDormitoriesBulk, deleteDormitory, addDormitoryStudentsBulk, deleteDormitoryStudent, addDormitoryPermissionRecord, deleteDormitoryPermissionRecord,
      createNewUser, updateUserRole
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
