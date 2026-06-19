import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, mockCourses } from '../mock/data';

interface CourseState {
  courses: Course[];
  currentViewDate: string;
  currentCourse: Course | null;
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  setCurrentCourse: (course: Course | null) => void;
  setCurrentViewDate: (date: string) => void;
  updateCourseStatus: (id: string, status: Course['status']) => void;
  getCoursesByDate: (date: string) => Course[];
  getCoursesByDateRange: (startDate: string, endDate: string) => Course[];
  getCoursesByClassroom: (classroomId: string) => Course[];
  getCoursesByTeacher: (teacherId: string) => Course[];
  getCoursesByStyle: (style: string) => Course[];
  getCourseById: (id: string) => Course | undefined;
  getWeekCourses: (baseDate?: string) => Course[];
}

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: mockCourses,
      currentViewDate: formatDate(new Date()),
      currentCourse: null,

      addCourse: (course) =>
        set((state) => ({
          courses: [
            ...state.courses,
            {
              ...course,
              id: `crs-${Date.now()}`,
            },
          ],
        })),

      updateCourse: (id, data) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
          currentCourse:
            state.currentCourse?.id === id
              ? { ...state.currentCourse, ...data }
              : state.currentCourse,
        })),

      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          currentCourse:
            state.currentCourse?.id === id ? null : state.currentCourse,
        })),

      setCurrentCourse: (course) =>
        set(() => ({
          currentCourse: course,
        })),

      setCurrentViewDate: (date) =>
        set(() => ({
          currentViewDate: date,
        })),

      updateCourseStatus: (id, status) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        })),

      getCoursesByDate: (date) =>
        get().courses.filter((c) => c.date === date),

      getCoursesByDateRange: (startDate, endDate) =>
        get().courses.filter(
          (c) => c.date >= startDate && c.date <= endDate
        ),

      getCoursesByClassroom: (classroomId) =>
        get().courses.filter((c) => c.classroomId === classroomId),

      getCoursesByTeacher: (teacherId) =>
        get().courses.filter((c) => c.teacherId === teacherId),

      getCoursesByStyle: (style) =>
        get().courses.filter((c) => c.style === style),

      getCourseById: (id) =>
        get().courses.find((c) => c.id === id),

      getWeekCourses: (baseDate) => {
        const base = baseDate ? new Date(baseDate) : new Date();
        const dayOfWeek = base.getDay();
        const monday = new Date(base);
        monday.setDate(base.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return get().getCoursesByDateRange(
          formatDate(monday),
          formatDate(sunday)
        );
      },
    }),
    {
      name: 'course-store',
    }
  )
);
