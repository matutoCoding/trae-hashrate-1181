import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Match, mockMatches } from '../mock/data';

interface MatchState {
  matches: Match[];
  createMatch: (
    teacherId: string,
    studentId: string,
    totalScore: number,
    dimensionScores: Match['dimensionScores'],
    notes?: string
  ) => Match;
  confirmMatch: (id: string) => boolean;
  rejectMatch: (id: string) => boolean;
  archiveMatch: (id: string) => boolean;
  getByTeacher: (teacherId: string) => Match[];
  getByStudent: (studentId: string) => Match[];
  getAllArchived: () => Match[];
  getMatchById: (id: string) => Match | undefined;
  getPendingMatches: () => Match[];
}

const formatDateTime = (d: Date) =>
  d.toISOString().replace('T', ' ').slice(0, 19);

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
      matches: mockMatches,

      createMatch: (teacherId, studentId, totalScore, dimensionScores, notes = '') => {
        const newMatch: Match = {
          id: `mch-${Date.now()}`,
          teacherId,
          studentId,
          totalScore,
          dimensionScores,
          matchedAt: formatDateTime(new Date()),
          status: '待确认',
          notes,
        };
        set((state) => ({
          matches: [...state.matches, newMatch],
        }));
        return newMatch;
      },

      confirmMatch: (id) => {
        const match = get().getMatchById(id);
        if (!match || match.status !== '待确认') return false;
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === id ? { ...m, status: '已确认' } : m
          ),
        }));
        return true;
      },

      rejectMatch: (id) => {
        const match = get().getMatchById(id);
        if (!match || match.status !== '待确认') return false;
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === id ? { ...m, status: '已拒绝' } : m
          ),
        }));
        return true;
      },

      archiveMatch: (id) => {
        const match = get().getMatchById(id);
        if (!match || match.status === '待确认') return false;
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === id
              ? { ...m, status: '已归档' }
              : m
          ),
        }));
        return true;
      },

      getByTeacher: (teacherId) =>
        get().matches.filter((m) => m.teacherId === teacherId),

      getByStudent: (studentId) =>
        get().matches.filter((m) => m.studentId === studentId),

      getAllArchived: () =>
        get().matches.filter((m) => m.status === '已归档'),

      getMatchById: (id) => get().matches.find((m) => m.id === id),

      getPendingMatches: () =>
        get().matches.filter((m) => m.status === '待确认'),
    }),
    {
      name: 'match-store',
    }
  )
);
