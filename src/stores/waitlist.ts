import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Waitlist, mockWaitlists } from '../mock/data';

interface WaitlistState {
  waitlists: Waitlist[];
  joinWaitlist: (courseId: string, studentId: string) => Waitlist | null;
  leaveWaitlist: (id: string) => void;
  notifyFirstInLine: (courseId: string) => Waitlist | null;
  confirmWaitlistEntry: (id: string) => boolean;
  skipWaitlistEntry: (id: string) => Waitlist | null;
  getByCourse: (courseId: string) => Waitlist[];
  getWaitlistById: (id: string) => Waitlist | undefined;
  getNextPosition: (courseId: string) => number;
  reorderPositions: (courseId: string) => void;
}

const formatDateTime = (d: Date) =>
  d.toISOString().replace('T', ' ').slice(0, 19);

export const useWaitlistStore = create<WaitlistState>()(
  persist(
    (set, get) => ({
      waitlists: mockWaitlists,

      getNextPosition: (courseId) => {
        const courseWaitlists = get()
          .getByCourse(courseId)
          .filter((w) => w.status !== '已取消' && w.status !== '已补位');
        if (courseWaitlists.length === 0) return 1;
        return Math.max(...courseWaitlists.map((w) => w.position)) + 1;
      },

      reorderPositions: (courseId) => {
        const activeList = get()
          .getByCourse(courseId)
          .filter((w) => w.status === '等待中' || w.status === '已通知')
          .sort((a, b) => a.position - b.position);
        const reordered = activeList.map((w, idx) => ({ ...w, position: idx + 1 }));
        set((state) => ({
          waitlists: state.waitlists.map((w) => {
            if (w.courseId !== courseId) return w;
            const updated = reordered.find((r) => r.id === w.id);
            return updated || w;
          }),
        }));
      },

      joinWaitlist: (courseId, studentId) => {
        const existing = get()
          .getByCourse(courseId)
          .find(
            (w) =>
              w.studentId === studentId &&
              (w.status === '等待中' || w.status === '已通知')
          );
        if (existing) return null;

        const newEntry: Waitlist = {
          id: `wls-${Date.now()}`,
          courseId,
          studentId,
          position: get().getNextPosition(courseId),
          status: '等待中',
          joinedAt: formatDateTime(new Date()),
          notifiedAt: null,
        };
        set((state) => ({
          waitlists: [...state.waitlists, newEntry],
        }));
        return newEntry;
      },

      leaveWaitlist: (id) => {
        const entry = get().getWaitlistById(id);
        if (!entry) return;
        set((state) => ({
          waitlists: state.waitlists.map((w) =>
            w.id === id ? { ...w, status: '已取消' } : w
          ),
        }));
        get().reorderPositions(entry.courseId);
      },

      notifyFirstInLine: (courseId) => {
        const firstInLine = get()
          .getByCourse(courseId)
          .filter((w) => w.status === '等待中')
          .sort((a, b) => a.position - b.position)[0];
        if (!firstInLine) return null;
        const notified: Waitlist = {
          ...firstInLine,
          status: '已通知',
          notifiedAt: formatDateTime(new Date()),
        };
        set((state) => ({
          waitlists: state.waitlists.map((w) =>
            w.id === firstInLine.id ? notified : w
          ),
        }));
        return notified;
      },

      confirmWaitlistEntry: (id) => {
        const entry = get().getWaitlistById(id);
        if (!entry || entry.status !== '已通知') return false;
        set((state) => ({
          waitlists: state.waitlists.map((w) =>
            w.id === id ? { ...w, status: '已补位' } : w
          ),
        }));
        get().reorderPositions(entry.courseId);
        return true;
      },

      skipWaitlistEntry: (id) => {
        const entry = get().getWaitlistById(id);
        if (!entry || entry.status !== '已通知') return null;
        set((state) => ({
          waitlists: state.waitlists.map((w) =>
            w.id === id ? { ...w, status: '已取消' } : w
          ),
        }));
        get().reorderPositions(entry.courseId);
        return get().notifyFirstInLine(entry.courseId);
      },

      getByCourse: (courseId) =>
        get().waitlists.filter((w) => w.courseId === courseId),

      getWaitlistById: (id) => get().waitlists.find((w) => w.id === id),
    }),
    {
      name: 'waitlist-store',
    }
  )
);
