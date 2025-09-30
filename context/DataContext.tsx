
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { Student, Course, Record, ClassName } from '../types';
import { AttendanceStatus } from '../types';
import { useMockData } from '../hooks/useMockData';

interface DataContextType {
  students: Student[];
  courses: Course[];
  records: Record[];
  addStudent: (name: string, className: ClassName) => void;
  addStudentsBulk: (names: string[], className: ClassName) => void;
  deleteStudent: (studentId: string) => void;
  addCourse: (name: string) => void;
  deleteCourse: (courseId: string) => void;
  addPermissionRecord: (studentId: string, date: string, status: AttendanceStatus.PERMISSION | AttendanceStatus.SICK) => void;
  addAttendanceRecords: (classRecords: { studentId: string; status: AttendanceStatus }[], date: string, course: string, className: ClassName) => void;
  deleteRecord: (recordId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { initialStudents, initialCourses, initialRecords } = useMockData();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [records, setRecords] = useState<Record[]>(initialRecords);

  const addStudent = useCallback((name: string, className: ClassName) => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name,
      className,
    };
    setStudents(prev => [...prev, newStudent]);
  }, []);
  
  const addStudentsBulk = useCallback((names: string[], className: ClassName) => {
    const newStudents: Student[] = names.map((name, index) => ({
      id: `student-${Date.now()}-${index}`,
      name: name.trim(),
      className,
    }));
    setStudents(prev => [...prev, ...newStudents]);
  }, []);

  const deleteStudent = useCallback((studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  }, []);

  const addCourse = useCallback((name: string) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name,
    };
    setCourses(prev => [...prev, newCourse]);
  }, []);

  const deleteCourse = useCallback((courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  }, []);

  const addPermissionRecord = useCallback((studentId: string, date: string, status: AttendanceStatus.PERMISSION | AttendanceStatus.SICK) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const newRecord: Record = {
      id: `record-${Date.now()}`,
      date,
      studentId,
      studentName: student.name,
      className: student.className,
      status,
      type: 'permission'
    };
    setRecords(prev => [...prev, newRecord]);
  }, [students]);

  const addAttendanceRecords = useCallback((classRecords: { studentId: string; status: AttendanceStatus }[], date: string, course: string, className: ClassName) => {
    const newRecords: Record[] = classRecords.map(({ studentId, status }) => {
      const student = students.find(s => s.id === studentId);
      return {
        id: `record-${Date.now()}-${studentId}`,
        date,
        studentId,
        studentName: student?.name || 'Unknown',
        className,
        status,
        course,
        type: 'attendance'
      };
    });
    setRecords(prev => [...prev, ...newRecords]);
  }, [students]);

  const deleteRecord = useCallback((recordId: string) => {
    setRecords(prev => prev.filter(r => r.id !== recordId));
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
