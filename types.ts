
export enum ClassName {
  TAMHIDI_1 = "تمهيدي ١",
  TAMHIDI_2 = "تمهيدي ٢",
  SANAH_1 = "السنة الأولى",
  SANAH_2 = "السنة الثانية",
  SANAH_3 = "السنة الثالثة",
  SANAH_4 = "السنة الرابعة",
}

export interface Student {
  id: string;
  name: string;
  className: ClassName;
}

export interface Course {
  id: string;
  name: string;
}

export enum AttendanceStatus {
  ABSENT = "غائب",
  PERMISSION = "إذن",
  SICK = "مرض",
}

export interface Record {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  className: ClassName;
  status: AttendanceStatus;
  course?: string; // Optional, only for attendance records
  type: 'permission' | 'attendance';
}

// New types for Dormitory
export interface Dormitory {
    id: string;
    name: string;
}

export interface DormitoryStudent {
    id: string;
    name: string;
    dormitoryId: string;
}

export interface DormitoryPermissionRecord {
    id: string;
    date: string; // YYYY-MM-DD
    studentId: string;
    studentName: string;
    dormitoryId: string;
    dormitoryName: string;
    description?: string;
}

// New type for User Profile with Role
export type UserRole = 'admin' | 'academic' | 'dormitory';

export interface Profile {
  id: string;
  role: UserRole;
  email?: string; // Added to manage users
}