import { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  RotateCcw,
  Star,
  Clock,
  Banknote,
  Sparkles,
  UserCheck,
  Handshake,
  Target,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentStore } from '@/stores/student';
import { useTeacherStore } from '@/stores/teacher';
import { useRecommendStore } from '@/stores/recommend';
import { useMatchStore } from '@/stores/match';
import { useNotificationStore } from '@/stores/notification';
import ScoreRadar from '@/components/ScoreRadar';
import DimensionBars from '@/components/DimensionBars';
import Avatar from '@/components/Avatar';
import {
  calculateDimensionScores,
  rankTeachers,
} from '@/utils/scoring';
import type { Teacher, Student } from '@/mock/data';

const weightLabels = [
  { key: 'styleMatch' as const, label: '书体匹配', icon: Target, desc: '学员目标书体与老师擅长书体的重合度' },
  { key: 'teacherRating' as const, label: '历史评分', icon: Star, desc: '老师的历史教学评分与口碑' },
  { key: 'styleFit' as const, label: '风格契合', icon: Sparkles, desc: '学员偏好风格与老师教学风格的匹配度' },
  { key: 'experience' as const, label: '教龄经验', icon: Award, desc: '老师从业年限与教学经验积累' },
  { key: 'priceMatch' as const, label: '价格匹配', icon: Banknote, desc: '老师时薪与学员预算区间的契合度' },
] as const;

type WeightKey = (typeof weightLabels)[number]['key'];

function WeightSlider({
  label,
  icon: Icon,
  desc,
  value,
  onChange,
}: {
  label: string;
  icon: typeof Target;
  desc: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const percent = Math.round(value * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-ink/50" />
          <span className="text-sm font-medium text-ink">{label}</span>
        </div>
        <span className="text-sm font-bold tabular-nums text-cinnabar">
          {percent}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={percent}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink/10 accent-cinnabar"
        style={{
          background: `linear-gradient(to right, #c0392b ${percent}%, rgba(26,26,46,0.1) ${percent}%)`,
        }}
      />
      <p className="text-[11px] leading-relaxed text-ink/40">{desc}</p>
    </div>
  );
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < full; i++) {
    stars.push(
      <Star
        key={`f-${i}`}
        className="h-3.5 w-3.5 fill-gold text-gold"
      />
    );
  }
  if (half) {
    stars.push(
      <Star
      key="half"
      className="h-3.5 w-3.5 text-gold"
      style={{
        background:
          'linear-gradient(90deg, #d4a017 50%, transparent 50%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    />
    );
  }
  const empty = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < empty; i++) {
    stars.push(
      <Star
        key={`e-${i}`}
        className="h-3.5 w-3.5 text-ink/15"
      />
    );
  }
  return stars;
}

function TeacherCard({
  teacher,
  score,
  dimensionScores,
  onMatch,
}: {
  teacher: Teacher;
  score: number;
  dimensionScores: ReturnType<typeof calculateDimensionScores>;
  onMatch: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-all hover:border-cinnabar/20 hover:shadow-md">
      <div className="flex flex-col gap-6 p-6 xl:flex-row">
        <div className="flex flex-col gap-4 xl:w-64 xl:shrink-0">
          <div className="flex items-start gap-4">
            <Avatar name={teacher.name} size="lg" className="!rounded-2xl border-2 border-white shadow-md" />
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-lg font-bold text-ink">{teacher.name}</h3>
              <div className="flex items-center gap-1.5">
                {renderStars(teacher.rating)}
                <span className="ml-1 text-xs font-semibold text-ink/60 tabular-nums">
                  {teacher.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {teacher.styles.map((s) => (
              <span
                key={s}
                className="rounded-md bg-bamboo/10 px-2 py-0.5 text-xs font-medium text-bamboo"
              >
                {s}
              </span>
            ))}
          </div>

          <span className="inline-flex w-fit items-center gap-1 rounded-md bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
            <Sparkles className="h-3 w-3" />
            {teacher.teachingStyle}
          </span>

          <div className="space-y-2 pt-1 border-t border-ink/8 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-ink/50">
                <Clock className="h-3.5 w-3.5" />
                教龄
              </span>
              <span className="font-semibold text-ink tabular-nums">
                {teacher.experienceYears} 年
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-ink/50">
                <Banknote className="h-3.5 w-3.5" />
                时薪
              </span>
              <span className="font-semibold text-cinnabar tabular-nums">
                ¥{teacher.pricePerHour}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center border-0 border-dashed border-ink/10 py-2 xl:border-l xl:px-6 xl:py-0">
          <ScoreRadar scores={dimensionScores} size={260} />
        </div>

        <div className="flex flex-1 flex-col gap-5 xl:min-w-[280px]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-ink/50">综合匹配度</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-cinnabar tabular-nums tracking-tight font-serif">
                  {score}
                </span>
                <span className="text-lg font-semibold text-cinnabar/60">
                  分
                </span>
              </div>
            </div>
          </div>

          <DimensionBars scores={dimensionScores} />

          <button
            onClick={onMatch}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cinnabar to-cinnabar/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cinnabar/20 transition-all hover:shadow-xl hover:shadow-cinnabar/30 active:scale-[0.99]"
          >
            <Handshake className="h-4 w-4" />
            确认撮合
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Recommend() {
  const students = useStudentStore((s) => s.students);
  const teachers = useTeacherStore((s) => s.teachers);

  const weights = useRecommendStore((s) => s.weights);
  const updateWeight = useRecommendStore((s) => s.updateWeight);
  const resetWeights = useRecommendStore((s) => s.resetWeights);
  const validateWeights = useRecommendStore((s) => s.validateWeights);
  const currentStudentId = useRecommendStore((s) => s.currentStudentId);
  const setCurrentStudentId = useRecommendStore((s) => s.setCurrentStudentId);
  const [studentDropdownOpen, setStudentDropdownOpen] =
    useState(false);

  const createMatch = useMatchStore((s) => s.createMatch);
  const pushNotification = useNotificationStore(
    (s) => s.pushNotification
  );

  const selectedStudent = useMemo(() => {
    if (currentStudentId) {
      return (
        students.find((s) => s.id === currentStudentId) ||
        students[0] ||
        null
      );
    }
    return students[0] || null;
  }, [currentStudentId, students]);

  useEffect(() => {
    if (!currentStudentId && students.length > 0) {
      setCurrentStudentId(students[0].id);
    }
  }, [currentStudentId, students, setCurrentStudentId]);

  const rankedTeachers = useMemo(() => {
    if (!selectedStudent) return [];
    return rankTeachers(teachers, selectedStudent, {
      styleMatch: weights.styleMatch,
      teacherRating: weights.teacherRating,
      styleFit: weights.styleFit,
      experience: weights.experience,
      priceMatch: weights.priceMatch,
    });
  }, [selectedStudent, teachers, weights]);

  const validation = validateWeights();
  const totalPercent = Math.round(validation.sum * 100);
  const isNormalized = validation.valid;

  const handleMatch = (item: (typeof rankedTeachers)[number]) => {
    if (!selectedStudent) return;
    const result = createMatch(
      item.teacher.id,
      selectedStudent.id,
      item.score,
      item.dimensionScores,
      `${selectedStudent.name} 与 ${item.teacher.name} 智能撮合`
    );
    if (result) {
      pushNotification(
        '撮合',
        `撮合成功：${item.teacher.name} × ${selectedStudent.name}`,
        `学员「${selectedStudent.name}」与老师「${item.teacher.name}」已成功撮合，综合得分 ${item.score} 分。`,
        result.id
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rice/50 via-white to-rice/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink font-serif">
            多维智能推荐
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            基于多维度权重配置，为学员精准匹配最合适的书法老师
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-5 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-cinnabar" />
                <h2 className="text-base font-semibold text-ink">
                  权重配置
                </h2>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-ink/60">
                  选择学员
                </label>
                <div className="relative">
                  <button
                    onClick={() =>
                      setStudentDropdownOpen(
                        !studentDropdownOpen
                      )
                    }
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-ink/12 bg-rice/40 px-3.5 py-2.5 text-left transition-all hover:border-cinnabar/30"
                  >
                    {selectedStudent ? (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={selectedStudent.name} size="sm" className="border-2 border-white shadow-sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {selectedStudent.name}
                          </p>
                          <p className="truncate text-[11px] text-ink/50">
                            {selectedStudent.level} · 预算¥{selectedStudent.budgetMin}-{selectedStudent.budgetMax}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-ink/40">
                        请选择学员
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-ink/40 transition-transform',
                        studentDropdownOpen &&
                          'rotate-180'
                      )}
                    />
                  </button>

                  {studentDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-ink/10 bg-white py-1 shadow-lg">
                      {students.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setCurrentStudentId(s.id);
                            setStudentDropdownOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors',
                            s.id === currentStudentId
                              ? 'bg-cinnabar/5'
                              : 'hover:bg-ink/5'
                          )}
                        >
                          <Avatar name={s.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">
                              {s.name}
                            </p>
                            <p className="truncate text-[11px] text-ink/50">
                              {s.level} · 目标：{s.targetStyles.join('、')}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-ink/8" />

              <div className="space-y-5">
                {weightLabels.map(({ key, label, icon, desc }) => (
                  <WeightSlider
                    key={key}
                    label={label}
                    icon={icon}
                    desc={desc}
                    value={weights[key]}
                    onChange={(v) => updateWeight(key, v)}
                  />
                ))}
              </div>

              <div className="h-px bg-ink/8" />

              <div className="space-y-3 rounded-xl bg-rice/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink/60">
                    当前总权重
                  </span>
                  <span
                    className={cn(
                      'text-base font-bold tabular-nums',
                      isNormalized
                        ? 'text-bamboo'
                        : 'text-cinnabar'
                    )}
                  >
                    {totalPercent}%
                  </span>
                </div>
                {!isNormalized && (
                  <p className="text-[11px] leading-relaxed text-cinnabar/70">
                    未归一化（非 100%），将按比例自动计算权重
                  </p>
                )}
                {isNormalized && (
                  <p className="text-[11px] leading-relaxed text-bamboo/70">
                    权重已归一化，计算结果准确
                  </p>
                )}
              </div>

              <button
                onClick={resetWeights}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-ink/12 bg-white px-3 py-2.5 text-xs font-medium text-ink/70 transition-all hover:border-cinnabar/30 hover:bg-cinnabar/5 hover:text-cinnabar"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                重置默认权重
              </button>
            </div>
          </div>

          <div className="space-y-4 xl:col-span-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">
                  推荐结果
                </h2>
                <span className="rounded-full bg-cinnabar/10 px-2.5 py-0.5 text-xs font-semibold text-cinnabar">
                  共 {rankedTeachers.length} 位匹配老师
                </span>
              </div>
              <span className="text-xs text-ink/50">
                按综合分降序排列
              </span>
            </div>

            {!selectedStudent || rankedTeachers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 py-20 text-center">
                <Sparkles className="mx-auto mb-3 h-12 w-12 text-ink/20" />
                <p className="text-sm text-ink/50">
                  {!selectedStudent
                    ? '请先选择学员'
                    : '暂无匹配的老师'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rankedTeachers.map((item) => (
                  <TeacherCard
                    key={item.teacher.id}
                    teacher={item.teacher}
                    score={item.score}
                    dimensionScores={item.dimensionScores}
                    onMatch={() => handleMatch(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
