
import { useMemo } from 'react';
import type { Student, Course, Record, ClassName } from '../types';
import { AttendanceStatus } from '../types';
import { CLASS_NAMES } from '../constants';

const arabicNames = [
  "أحمد", "محمد", "علي", "عمر", "خالد", "يوسف", "سعيد", "محمود", "حسن", "حسين",
  "فاطمة", "مريم", "زينب", "عائشة", "خديجة", "نور", "هدى", "سارة", "ليلى", "سلمى"
];

const generateStudents = (): Student[] => {
  const students: Student[] = [];
  let idCounter = 1;
  CLASS_NAMES.forEach(className => {
    for (let i = 0; i < 10; i++) {
      students.push({
        id: `student-${idCounter++}`,
        name: `${arabicNames[Math.floor(Math.random() * arabicNames.length)]} ${arabicNames[Math.floor(Math.random() * arabicNames.length)]}`,
        className: className as ClassName
      });
    }
  });
  return students;
};

const generateCourses = (): Course[] => {
  return [
    { id: 'course-1', name: 'القرآن الكريم' },
    { id: 'course-2', name: 'الحديث الشريف' },
    { id: 'course-3', name: 'الفقه' },
    { id: 'course-4', name: 'التفسير' },
    { id: 'course-5', name: 'النحو' },
  ];
};


export const useMockData = () => {
  const initialStudents = useMemo(() => generateStudents(), []);
  const initialCourses = useMemo(() => generateCourses(), []);
  const initialRecords: Record[] = []; // Start with no records to keep it clean

  return { initialStudents, initialCourses, initialRecords };
};
