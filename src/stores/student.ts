import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, mockStudents } from '../mock/data';

interface StudentState {
  students: Student[];
  currentStudent: Student | null;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  setCurrentStudent: (student: Student | null) => void;
  getStudentsByLevel: (level: Student['level']) => Student[];
  getStudentsByTargetStyle: (style: string) => Student[];
  getStudentById: (id: string) => Student | undefined;
  getStudentsByBudget: (min: number, max: number) => Student[];
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: mockStudents,
      currentStudent: null,

      addStudent: (student) =>
        set((state) => ({
          students: [
            ...state.students,
            {
              ...student,
              id: `stu-${Date.now()}`,
            },
          ],
        })),

      updateStudent: (id, data) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
          currentStudent:
            state.currentStudent?.id === id
              ? { ...state.currentStudent, ...data }
              : state.currentStudent,
        })),

      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
          currentStudent:
            state.currentStudent?.id === id ? null : state.currentStudent,
        })),

      setCurrentStudent: (student) =>
        set(() => ({
          currentStudent: student,
        })),

      getStudentsByLevel: (level) =>
        get().students.filter((s) => s.level === level),

      getStudentsByTargetStyle: (style) =>
        get().students.filter((s) => s.targetStyles.includes(style)),

      getStudentById: (id) =>
        get().students.find((s) => s.id === id),

      getStudentsByBudget: (min, max) =>
        get().students.filter(
          (s) => s.budgetMax >= min && s.budgetMin <= max
        ),
    }),
    {
      name: 'student-store',
    }
  )
);
