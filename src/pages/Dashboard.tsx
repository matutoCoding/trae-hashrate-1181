import { useMemo } from 'react';
import {
  Calendar,
  Users,
  Handshake,
  Target,
  CalendarClock,
  UserPlus,
  Settings,
  PlusCircle,
  UserCheck,
  RefreshCw,
  Star,
} from 'lucide-react';
import { useCourseStore } from '@/stores/course';
import { useWaitlistStore } from '@/stores/waitlist';
import { useMatchStore } from '@/stores/match';
import { useBookingStore } from '@/stores/booking';
import { useStudentStore } from '@/stores/student';
import { cn } from '@/lib/utils';

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export default function Dashboard() {
  const { courses, getWeekCourses } = useCourseStore();
  const { waitlists } = useWaitlistStore();
  const { matches } = useMatchStore();
  const { bookings } = useBookingStore();
  const { students } = useStudentStore();

  const today = formatDate(new Date());

  const todayCourses = useMemo(
    () => courses.filter((c) => c.date === today),
    [courses, today]
  );

  const waitingCount = useMemo(
    () => waitlists.filter((w) => w.status === '等待中').length,
    [waitlists]
  );

  const monthMatches = useMemo(() => {
    const now = new Date();
    const monthStart = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const monthEnd = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return matches.filter((m) => {
      const d = m.matchedAt.split(' ')[0];
      return d >= monthStart && d <= monthEnd;
    });
  }, [matches]);

  const matchSuccessRate = useMemo(() => {
    if (monthMatches.length === 0) return 0;
    const confirmed = monthMatches.filter(
      (m) => m.status === '已确认' || m.status === '已完成'
    ).length;
    return Math.round((confirmed / monthMatches.length) * 100);
  }, [monthMatches]);

  const kpiCards = [
    {
      title: '今日课程数',
      value: todayCourses.length,
      icon: Calendar,
      gradient: 'from-ink/90 to-ink/70',
      suffix: '节',
    },
    {
      title: '等待中候补',
      value: waitingCount,
      icon: Users,
      gradient: 'from-cinnabar/90 to-cinnabar/70',
      suffix: '人',
    },
    {
      title: '本月撮合数',
      value: monthMatches.length,
      icon: Handshake,
      gradient: 'from-bamboo/90 to-bamboo/70',
      suffix: '对',
    },
    {
      title: '撮合成功率',
      value: matchSuccessRate,
      icon: Target,
      gradient: 'from-gold/90 to-gold/70',
      suffix: '%',
    },
  ];

  const weekActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      type: string;
      title: string;
      time: string;
      icon: typeof CalendarClock;
    }> = [];

    bookings.forEach((b) => {
      const student = students.find((s) => s.id === b.studentId);
      const course = courses.find((c) => c.id === b.courseId);
      if (b.status === '已预约') {
        activities.push({
          id: `bk-${b.id}`,
          type: '预约',
          title: `${student?.name || '学员'} 预约了 ${course?.title || '课程'}`,
          time: b.bookedAt,
          icon: CalendarClock,
        });
      } else if (b.status === '超时释放') {
        activities.push({
          id: `rl-${b.id}`,
          type: '释放',
          title: `${student?.name || '学员'} 未签到，${course?.title || '课程'}名额已释放`,
          time: b.bookedAt,
          icon: RefreshCw,
        });
      } else if (b.status === '已签到') {
        activities.push({
          id: `ci-${b.id}`,
          type: '签到',
          title: `${student?.name || '学员'} 已签到 ${course?.title || '课程'}`,
          time: b.checkInAt || b.bookedAt,
          icon: UserCheck,
        });
      }
    });

    waitlists.forEach((w) => {
      if (w.status === '已补位') {
        const student = students.find((s) => s.id === w.studentId);
        const course = courses.find((c) => c.id === w.courseId);
        activities.push({
          id: `wl-${w.id}`,
          type: '补位',
          title: `${student?.name || '学员'} 成功补位 ${course?.title || '课程'}`,
          time: w.notifiedAt || w.joinedAt,
          icon: UserPlus,
        });
      }
    });

    matches.forEach((m) => {
      if (m.status === '已确认' || m.status === '已完成') {
        activities.push({
          id: `mt-${m.id}`,
          type: '撮合',
          title: `撮合成功，得分 ${m.totalScore} 分`,
          time: m.matchedAt,
          icon: Handshake,
        });
      }
    });

    activities.push({
      id: 'rt-001',
      type: '评分',
      title: '王墨轩老师为《九成宫醴泉铭临摹》评分 88 分',
      time: formatDate(new Date(Date.now() - 86400000 * 2)) + ' 10:30:00',
      icon: Star,
    });

    return activities
      .sort((a, b) => new Date(b.time.replace(' ', 'T')).getTime() - new Date(a.time.replace(' ', 'T')).getTime())
      .slice(0, 5);
  }, [bookings, courses, matches, students, waitlists]);

  const weekHeatmap = useMemo(() => {
    const weekCourses = getWeekCourses();
    const base = new Date();
    const dayOfWeek = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return formatDate(d);
    });

    const timeSlots = ['09:00', '11:00', '14:00', '16:00', '19:00'];
    const slotRanges = [
      ['08:00', '10:59'],
      ['11:00', '13:59'],
      ['14:00', '15:59'],
      ['16:00', '18:59'],
      ['19:00', '21:59'],
    ];

    const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    const heatmap = days.map((day, dayIdx) => ({
      date: day,
      label: dayLabels[dayIdx],
      slots: timeSlots.map((slot, slotIdx) => {
        const [start, end] = slotRanges[slotIdx];
        const count = weekCourses.filter((c) => {
          if (c.date !== day) return false;
          return c.startTime >= start && c.startTime <= end;
        }).length;
        return { slot, count };
      }),
    }));

    const maxCount = Math.max(
      1,
      ...heatmap.flatMap((d) => d.slots.map((s) => s.count))
    );

    return { heatmap, maxCount, timeSlots };
  }, [getWeekCourses]);

  const getHeatColor = (count: number, max: number) => {
    if (count === 0) return 'bg-bamboo/5';
    const ratio = count / max;
    if (ratio <= 0.25) return 'bg-bamboo/20';
    if (ratio <= 0.5) return 'bg-bamboo/40';
    if (ratio <= 0.75) return 'bg-bamboo/60';
    return 'bg-bamboo/80';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink font-serif">仪表盘</h1>
          <p className="mt-1 text-sm text-ink/60">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={cn(
                'relative overflow-hidden rounded-2xl p-5 text-white shadow-lg',
                'bg-gradient-to-br',
                card.gradient
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">{card.title}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{card.value}</span>
                    <span className="text-sm text-white/70">{card.suffix}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px]"
                style={{
                  background:
                    'linear-gradient(to right, rgba(192,57,43,0), rgba(192,57,43,0.8), rgba(192,57,43,0))',
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold text-ink font-serif">最近活动</h2>
          <div className="mt-5 space-y-0">
            {weekActivities.map((activity, idx) => {
              const Icon = activity.icon;
              const isLast = idx === weekActivities.length - 1;
              const timeStr = activity.time.split(' ')[1] || activity.time;
              return (
                <div key={activity.id} className="relative flex gap-4 pb-5">
                  {!isLast && (
                    <div className="absolute left-[14px] top-7 h-[calc(100%-1.5rem)] w-px bg-ink/10" />
                  )}
                  <div className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-cinnabar bg-white">
                    <div className="h-2.5 w-2.5 rounded-full bg-cinnabar" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-cinnabar/10 px-2 py-0.5 text-xs font-medium text-cinnabar">
                        <Icon className="h-3 w-3" />
                        {activity.type}
                      </span>
                      <span className="text-xs text-ink/40">{timeStr}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-ink/80 line-clamp-2">
                      {activity.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink font-serif">本周排课热力图</h2>
            <div className="flex items-center gap-4 text-xs text-ink/50">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-bamboo/5" />
                <span>少</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-bamboo/80" />
                <span>多</span>
              </div>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="flex">
                <div className="w-16 shrink-0" />
                <div className="flex flex-1">
                  {weekHeatmap.heatmap.map((day) => (
                    <div
                      key={day.date}
                      className="flex-1 px-1 text-center text-xs font-medium text-ink/70"
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                {weekHeatmap.timeSlots.map((slot, slotIdx) => (
                  <div key={slot} className="flex items-center gap-2">
                    <div className="w-14 shrink-0 text-right text-xs text-ink/50">
                      {slot}
                    </div>
                    <div className="flex flex-1 gap-1.5">
                      {weekHeatmap.heatmap.map((day) => {
                        const data = day.slots[slotIdx];
                        return (
                          <div
                            key={`${day.date}-${slot}`}
                            className={cn(
                              'flex h-10 flex-1 items-center justify-center rounded-lg transition-all hover:ring-2 hover:ring-bamboo/50',
                              getHeatColor(data.count, weekHeatmap.maxCount)
                            )}
                            title={`${day.label} ${slot}: ${data.count} 节课程`}
                          >
                            {data.count > 0 && (
                              <span
                                className={cn(
                                  'text-xs font-semibold',
                                  data.count / weekHeatmap.maxCount > 0.5
                                    ? 'text-white'
                                    : 'text-bamboo'
                                )}
                              >
                                {data.count}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink font-serif">快捷操作</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="group flex items-center gap-4 rounded-xl border border-ink/10 bg-rice/50 p-4 text-left transition-all hover:border-ink/20 hover:bg-rice hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ink to-ink/70 text-white transition-transform group-hover:scale-105">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-ink">新建课程</p>
              <p className="mt-0.5 text-xs text-ink/50">快速创建新的书法课程</p>
            </div>
          </button>
          <button className="group flex items-center gap-4 rounded-xl border border-ink/10 bg-rice/50 p-4 text-left transition-all hover:border-ink/20 hover:bg-rice hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bamboo to-bamboo/70 text-white transition-transform group-hover:scale-105">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-ink">新建学员</p>
              <p className="mt-0.5 text-xs text-ink/50">添加新学员档案信息</p>
            </div>
          </button>
          <button className="group flex items-center gap-4 rounded-xl border border-ink/10 bg-rice/50 p-4 text-left transition-all hover:border-ink/20 hover:bg-rice hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold/70 text-white transition-transform group-hover:scale-105">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-ink">权重配置</p>
              <p className="mt-0.5 text-xs text-ink/50">调整撮合算法权重参数</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
