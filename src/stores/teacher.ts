import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Teacher, mockTeachers } from '../mock/data';

interface TeacherState {
  teachers: Teacher[];
  currentTeacher: Teacher | null;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  setCurrentTeacher: (teacher: Teacher | null) => void;
  getTeachersByStyle: (style: string) => Teacher[];
  getTeacherById: (id: string) => Teacher | undefined;
  getTeachersByPriceRange: (min: number, max: number) => Teacher[];
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set, get) => ({
      teachers: mockTeachers,
      currentTeacher: null,

      addTeacher: (teacher) =>
        set((state) => ({
          teachers: [
            ...state.teachers,
            {
              ...teacher,
              id: `tch-${Date.now()}`,
            },
          ],
        })),

      updateTeacher: (id, data) =>
        set((state) => ({
          teachers: state.teachers.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
          currentTeacher:
            state.currentTeacher?.id === id
              ? { ...state.currentTeacher, ...data }
              : state.currentTeacher,
        })),

      deleteTeacher: (id) =>
        set((state) => ({
          teachers: state.teachers.filter((t) => t.id !== id),
          currentTeacher:
            state.currentTeacher?.id === id ? null : state.currentTeacher,
        })),

      setCurrentTeacher: (teacher) =>
        set(() => ({
          currentTeacher: teacher,
        })),

      getTeachersByStyle: (style) =>
        get().teachers.filter((t) => t.styles.includes(style)),

      getTeacherById: (id) =>
        get().teachers.find((t) => t.id === id),

      getTeachersByPriceRange: (min, max) =>
        get().teachers.filter(
          (t) => t.pricePerHour >= min && t.pricePerHour <= max
        ),
    }),
    {
      name: 'teacher-store',
    }
  )
);
