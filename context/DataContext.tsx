import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Student, Course, Record, ClassName } from '../types';
import { AttendanceStatus } from '../types';

interface DataContextType {
  students: Student[];
  courses: Course[];
  records: Record[];
  addStudent: (name: string, className: ClassName) => Promise<void>;
  addStudentsBulk: (names: string[], className: ClassName) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addCourse: (name: string) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addPermissionRecord: (studentId: string, date: string, status: AttendanceStatus.PERMISSION | AttendanceStatus.SICK) => Promise<void>;
  addAttendanceRecords: (classRecords: { studentId: string; status: AttendanceStatus }[], date: string, course: string, className: ClassName) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').order('name');
      if (studentsError) console.error('Error fetching students:', studentsError.message);
      else setStudents(studentsData || []);

      const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*').order('name');
      if (coursesError) console.error('Error fetching courses:', coursesError.message);
      else setCourses(coursesData || []);
      
      const { data: recordsData, error: recordsError } = await supabase.from('records').select('*').order('date', { ascending: false });
      if (recordsError) console.error('Error fetching records:', recordsError.message);
      else setRecords(recordsData || []);
    };

    fetchData();

    const channel = supabase.channel('db-changes');
    const subscription = channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'students' }, (payload) => setStudents(prev => [...prev, payload.new as Student].sort((a,b) => a.name.localeCompare(b.name))))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'students' }, (payload) => setStudents(prev => prev.filter(s => s.id !== (payload.old as Student).id)))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'courses' }, (payload) => setCourses(prev => [...prev, payload.new as Course].sort((a,b) => a.name.localeCompare(b.name))))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'courses' }, (payload) => setCourses(prev => prev.filter(c => c.id !== (payload.old as Course).id)))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'records' }, (payload) => setRecords(prev => [payload.new as Record, ...prev]))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'records' }, (payload) => setRecords(prev => prev.filter(r => r.id !== (payload.old as Record).id)))
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, []);
  
  const addStudent = useCallback(async (name: string, className: ClassName) => {
    const { error } = await supabase.from('students').insert({ name, className });
    if (error) console.error('Error adding student:', error.message);
  }, []);
  
  const addStudentsBulk = useCallback(async (names: string[], className: ClassName) => {
    const newStudents = names.map(name => ({ name: name.trim(), className }));
    if (newStudents.length > 0) {
        const { error } = await supabase.from('students').insert(newStudents);
        if (error) console.error('Error adding students in bulk:', error.message);
    }
  }, []);

  const deleteStudent = useCallback(async (studentId: string) => {
    // Also delete related records
    await supabase.from('records').delete().eq('studentId', studentId);
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) console.error('Error deleting student:', error.message);
  }, []);

  const addCourse = useCallback(async (name: string) => {
    const { error } = await supabase.from('courses').insert({ name });
    if (error) console.error('Error adding course:', error.message);
  }, []);

  const deleteCourse = useCallback(async (courseId: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) console.error('Error deleting course:', error.message);
  }, []);

  const addPermissionRecord = useCallback(async (studentId: string, date: string, status: AttendanceStatus.PERMISSION | AttendanceStatus.SICK) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        console.error("Student not found for permission record");
        return;
    }
    const newRecord = {
      date,
      studentId,
      studentName: student.name,
      className: student.className,
      status,
      type: 'permission' as const
    };
    const { error } = await supabase.from('records').insert(newRecord);
    if (error) console.error('Error adding permission record:', error.message);
  }, [students]);

  const addAttendanceRecords = useCallback(async (classRecords: { studentId: string; status: AttendanceStatus }[], date: string, course: string, className: ClassName) => {
    const newRecords = classRecords.map(({ studentId, status }) => {
      const student = students.find(s => s.id === studentId);
      return {
        date,
        studentId,
        studentName: student?.name || 'Unknown',
        className,
        status,
        course,
        type: 'attendance' as const
      };
    });
    if (newRecords.length > 0) {
        const { error } = await supabase.from('records').insert(newRecords);
        if (error) console.error('Error adding attendance records:', error.message);
    }
  }, [students]);

  const deleteRecord = useCallback(async (recordId: string) => {
    const { error } = await supabase.from('records').delete().eq('id', recordId);
    if (error) console.error('Error deleting record:', error.message);
  }, []);

  return (
    <DataContext.Provider value={{ students, courses, records, addStudent, deleteStudent, addCourse, deleteCourse, addPermissionRecord, addAttendanceRecords, addStudentsBulk, deleteRecord }}>
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