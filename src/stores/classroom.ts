import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Classroom, mockClassrooms } from '../mock/data';

interface ClassroomState {
  classrooms: Classroom[];
  currentClassroom: Classroom | null;
  addClassroom: (classroom: Omit<Classroom, 'id'>) => void;
  updateClassroom: (id: string, data: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;
  setCurrentClassroom: (classroom: Classroom | null) => void;
  toggleActive: (id: string) => void;
  getActiveClassrooms: () => Classroom[];
  getClassroomById: (id: string) => Classroom | undefined;
}

export const useClassroomStore = create<ClassroomState>()(
  persist(
    (set, get) => ({
      classrooms: mockClassrooms,
      currentClassroom: null,

      addClassroom: (classroom) =>
        set((state) => ({
          classrooms: [
            ...state.classrooms,
            {
              ...classroom,
              id: `cls-${Date.now()}`,
            },
          ],
        })),

      updateClassroom: (id, data) =>
        set((state) => ({
          classrooms: state.classrooms.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
          currentClassroom:
            state.currentClassroom?.id === id
              ? { ...state.currentClassroom, ...data }
              : state.currentClassroom,
        })),

      deleteClassroom: (id) =>
        set((state) => ({
          classrooms: state.classrooms.filter((c) => c.id !== id),
          currentClassroom:
            state.currentClassroom?.id === id ? null : state.currentClassroom,
        })),

      setCurrentClassroom: (classroom) =>
        set(() => ({
          currentClassroom: classroom,
        })),

      toggleActive: (id) =>
        set((state) => ({
          classrooms: state.classrooms.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        })),

      getActiveClassrooms: () =>
        get().classrooms.filter((c) => c.isActive),

      getClassroomById: (id) =>
        get().classrooms.find((c) => c.id === id),
    }),
    {
      name: 'classroom-store',
    }
  )
);
