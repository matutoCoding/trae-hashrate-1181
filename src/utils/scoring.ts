import type { Teacher, Student, WeightConfig } from '@/mock/data';

type WeightKeys = Omit<WeightConfig, 'id' | 'updatedAt'>;

export function calculateDimensionScores(
  teacher: Teacher,
  student: Student
): {
  styleMatch: number;
  teacherRating: number;
  styleFit: number;
  experience: number;
  priceMatch: number;
} {
  const styleOverlap = teacher.styles.filter((s) => student.targetStyles.includes(s));
  const styleMatch = student.targetStyles.length > 0
    ? (styleOverlap.length / student.targetStyles.length) * 100
    : 0;

  const teacherRating = (teacher.rating / 5) * 100;

  const styleFit = teacher.teachingStyle === student.preferredStyle ? 100 : 50;

  const experience = Math.min((teacher.experienceYears / 20) * 100, 100);

  const budgetMid = (student.budgetMin + student.budgetMax) / 2;
  const priceDiff = Math.abs(teacher.pricePerHour - budgetMid);
  const priceRange = student.budgetMax - student.budgetMin;
  const priceMatch = priceRange > 0
    ? Math.max(100 - (priceDiff / (priceRange / 2)) * 100, 0)
    : teacher.pricePerHour === budgetMid ? 100 : Math.max(100 - (priceDiff / budgetMid) * 100, 0);

  return {
    styleMatch: Math.round(styleMatch),
    teacherRating: Math.round(teacherRating),
    styleFit,
    experience: Math.round(experience),
    priceMatch: Math.round(priceMatch),
  };
}

export function calculateMatchScore(
  teacher: Teacher,
  student: Student,
  weights: WeightKeys
): number {
  const scores = calculateDimensionScores(teacher, student);
  const totalWeight =
    weights.styleMatch +
    weights.teacherRating +
    weights.styleFit +
    weights.experience +
    weights.priceMatch;

  if (totalWeight === 0) return 0;

  const weightedSum =
    scores.styleMatch * weights.styleMatch +
    scores.teacherRating * weights.teacherRating +
    scores.styleFit * weights.styleFit +
    scores.experience * weights.experience +
    scores.priceMatch * weights.priceMatch;

  return Math.round(weightedSum / totalWeight);
}

export function rankTeachers(
  teachers: Teacher[],
  student: Student,
  weights: WeightKeys
): Array<{
  teacher: Teacher;
  score: number;
  dimensionScores: ReturnType<typeof calculateDimensionScores>;
}> {
  return teachers
    .map((teacher) => ({
      teacher,
      score: calculateMatchScore(teacher, student, weights),
      dimensionScores: calculateDimensionScores(teacher, student),
    }))
    .sort((a, b) => b.score - a.score);
}
