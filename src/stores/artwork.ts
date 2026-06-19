import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Artwork, mockArtworks } from '../mock/data';

interface ArtworkState {
  artworks: Artwork[];
  submitArtwork: (data: {
    matchId: string;
    studentId: string;
    imageUrl: string;
    title: string;
    style: string;
  }) => Artwork;
  rateArtwork: (id: string, score: number, comment: string) => boolean;
  getByStudent: (studentId: string) => Artwork[];
  getByMatch: (matchId: string) => Artwork[];
  getArtworkById: (id: string) => Artwork | undefined;
  getUnratedArtworks: () => Artwork[];
  updateArtwork: (id: string, data: Partial<Artwork>) => void;
  deleteArtwork: (id: string) => void;
}

const formatDateTime = (d: Date) =>
  d.toISOString().replace('T', ' ').slice(0, 19);

export const useArtworkStore = create<ArtworkState>()(
  persist(
    (set, get) => ({
      artworks: mockArtworks,

      submitArtwork: (data) => {
        const newArtwork: Artwork = {
          id: `art-${Date.now()}`,
          matchId: data.matchId,
          studentId: data.studentId,
          imageUrl: data.imageUrl,
          title: data.title,
          style: data.style,
          score: 0,
          teacherComment: '',
          submittedAt: formatDateTime(new Date()),
        };
        set((state) => ({
          artworks: [...state.artworks, newArtwork],
        }));
        return newArtwork;
      },

      rateArtwork: (id, score, comment) => {
        const artwork = get().getArtworkById(id);
        if (!artwork) return false;
        set((state) => ({
          artworks: state.artworks.map((a) =>
            a.id === id
              ? {
                  ...a,
                  score: Math.max(0, Math.min(100, score)),
                  teacherComment: comment,
                }
              : a
          ),
        }));
        return true;
      },

      getByStudent: (studentId) =>
        get().artworks.filter((a) => a.studentId === studentId),

      getByMatch: (matchId) =>
        get().artworks.filter((a) => a.matchId === matchId),

      getArtworkById: (id) => get().artworks.find((a) => a.id === id),

      getUnratedArtworks: () =>
        get().artworks.filter((a) => a.score === 0 && !a.teacherComment),

      updateArtwork: (id, data) =>
        set((state) => ({
          artworks: state.artworks.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        })),

      deleteArtwork: (id) =>
        set((state) => ({
          artworks: state.artworks.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'artwork-store',
    }
  )
);
