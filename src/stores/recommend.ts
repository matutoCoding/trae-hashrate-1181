import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeightConfig, mockWeightConfig } from '../mock/data';

interface RecommendState {
  weights: WeightConfig;
  currentStudentId: string | null;
  defaultWeights: WeightConfig;
  setWeights: (weights: Partial<WeightConfig>) => void;
  updateWeight: (
    key: keyof Omit<WeightConfig, 'id' | 'updatedAt'>,
    value: number
  ) => void;
  getWeights: () => Omit<WeightConfig, 'id' | 'updatedAt'>;
  resetWeights: () => void;
  normalizeWeights: () => void;
  validateWeights: (
    weights?: Omit<WeightConfig, 'id' | 'updatedAt'>
  ) => { valid: boolean; sum: number; deviation: number };
  setCurrentStudentId: (studentId: string | null) => void;
}

const formatDateTime = (d: Date) =>
  d.toISOString().replace('T', ' ').slice(0, 19);

const extractWeightValues = (
  config: WeightConfig
): Omit<WeightConfig, 'id' | 'updatedAt'> => ({
  styleMatch: config.styleMatch,
  teacherRating: config.teacherRating,
  styleFit: config.styleFit,
  experience: config.experience,
  priceMatch: config.priceMatch,
});

const WEIGHT_KEYS: Array<keyof Omit<WeightConfig, 'id' | 'updatedAt'>> = [
  'styleMatch',
  'teacherRating',
  'styleFit',
  'experience',
  'priceMatch',
];

export const useRecommendStore = create<RecommendState>()(
  persist(
    (set, get) => ({
      weights: mockWeightConfig,
      currentStudentId: null,
      defaultWeights: mockWeightConfig,

      getWeights: () => extractWeightValues(get().weights),

      setWeights: (weights) => {
        const current = get().weights;
        const updated: WeightConfig = {
          ...current,
          ...weights,
          updatedAt: formatDateTime(new Date()),
        };
        set(() => ({ weights: updated }));
      },

      updateWeight: (key, value) => {
        set((state) => ({
          weights: {
            ...state.weights,
            [key]: Math.max(0, Math.min(1, value)),
            updatedAt: formatDateTime(new Date()),
          },
        }));
      },

      resetWeights: () => {
        set((state) => ({
          weights: {
            ...state.defaultWeights,
            updatedAt: formatDateTime(new Date()),
          },
        }));
      },

      normalizeWeights: () => {
        const weights = get().getWeights();
        const sum = WEIGHT_KEYS.reduce((acc, key) => acc + (weights[key] || 0), 0);
        if (sum === 0) {
          const evenWeight = 1 / WEIGHT_KEYS.length;
          const normalized: WeightConfig = {
            ...get().weights,
            styleMatch: evenWeight,
            teacherRating: evenWeight,
            styleFit: evenWeight,
            experience: evenWeight,
            priceMatch: evenWeight,
            updatedAt: formatDateTime(new Date()),
          };
          set(() => ({ weights: normalized }));
          return;
        }
        const normalized: WeightConfig = {
          ...get().weights,
          styleMatch: weights.styleMatch / sum,
          teacherRating: weights.teacherRating / sum,
          styleFit: weights.styleFit / sum,
          experience: weights.experience / sum,
          priceMatch: weights.priceMatch / sum,
          updatedAt: formatDateTime(new Date()),
        };
        set(() => ({ weights: normalized }));
      },

      validateWeights: (weights) => {
        const w = weights || get().getWeights();
        const sum = WEIGHT_KEYS.reduce((acc, key) => acc + (w[key] || 0), 0);
        const deviation = Math.abs(sum - 1);
        return {
          valid: deviation < 1e-6,
          sum,
          deviation,
        };
      },

      setCurrentStudentId: (studentId) => {
        set(() => ({ currentStudentId: studentId }));
      },
    }),
    {
      name: 'recommend-store',
    }
  )
);
