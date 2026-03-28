export type UserRole = 'admin' | 'lecturer' | 'student';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: any;
}

export interface Course {
  id: string;
  lecturerId: string;
  title: string;
  description: string;
  createdAt: any;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  createdAt: any;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  type: 'text' | 'file';
  content?: string; // Pasted text
  fileUrl?: string; // Firebase Storage URL
  fileName?: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  feedback?: string;
  plan?: StudyPlan; // Keep existing plan field for backward compatibility or use it for AI plan
  completedAt?: any;
  createdAt: any;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  lecturerId: string;
  date: string; // YYYY-MM-DD
  timestamp: any;
  status: 'present' | 'absent';
}

export interface StudyPlan {
  steps: {
    task: string;
    time: string;
  }[];
}

export interface Question {
  id: string;
  type: 'mcq' | 'short';
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation?: string;
}

export interface MockExam {
  id: string;
  title: string;
  questions: Question[];
  durationMinutes: number;
  createdAt: any;
}
