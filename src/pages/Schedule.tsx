import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Timer,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { useCourseStore } from '@/stores/course';
import { useClassroomStore } from '@/stores/classroom';
import { useTeacherStore } from '@/stores/teacher';
import { useBookingStore } from '@/stores/booking';
import { useStudentStore } from '@/stores/student';
import { useWaitlistStore } from '@/stores/waitlist';
import { checkAndReleaseBookings } from '@/utils/scheduler';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import Avatar from '@/components/Avatar';
import { cn } from '@/lib/utils';

const formatDate = (d: Date) => d.toISOString().split('T')[0];
const formatDateTime = (d: Date) =>
  d.toISOString().replace('T', ' ').slice(0, 19);

const TIME_SLOTS = [
  '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00',
];

const ALL_EQUIPMENT_OPTIONS = [
  '毛毡桌垫', '投影设备', '笔墨套装', '宣纸架',
  '临摹碑帖展示柜', '多媒体音响', '砚台陈列柜',
  '印章工作台', '作品展示墙',
];

const CALLIGRAPHY_STYLES = ['楷书', '行书', '草书', '隶书', '篆书', '魏碑', '硬笔'];

const STYLE_COLORS: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  '楷书': { bg: 'bg-ink', border: 'border-ink/30', text: 'text-white', hover: 'hover:bg-ink/90' },
  '行书': { bg: 'bg-cinnabar', border: 'border-cinnabar/30', text: 'text-white', hover: 'hover:bg-cinnabar/90' },
  '草书': { bg: 'bg-bamboo', border: 'border-bamboo/30', text: 'text-white', hover: 'hover:bg-bamboo/90' },
  '隶书': { bg: 'bg-gold', border: 'border-gold/30', text: 'text-white', hover: 'hover:bg-gold/90' },
  '篆书': { bg: 'bg-purple-700', border: 'border-purple-700/30', text: 'text-white', hover: 'hover:bg-purple-700/90' },
  '魏碑': { bg: 'bg-slate-600', border: 'border-slate-600/30', text: 'text-white', hover: 'hover:bg-slate-600/90' },
  '硬笔': { bg: 'bg-teal-600', border: 'border-teal-600/30', text: 'text-white', hover: 'hover:bg-teal-600/90' },
};

type TabType = 'calendar' | 'classroom';

type ClassroomFormData = {
  name: string;
  capacity: number;
  equipment: string[];
  calligraphyStyles: string[];
  isActive: boolean;
};

type CourseFormData = {
  title: string;
  classroomId: string;
  teacherId: string;
  style: string;
  date: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
};

type CourseDetailTab = 'booked' | 'checked_in' | 'timeout_released' | 'waitlist_filled';

export default function Schedule() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [weekOffset, setWeekOffset] = useState(0);
  const [, forceUpdate] = useState(0);
  const [courseDetailTab, setCourseDetailTab] = useState<CourseDetailTab>('booked');

  const { courses, addCourse, getWeekCourses } = useCourseStore();
  const { classrooms, addClassroom, updateClassroom, deleteClassroom, toggleActive } = useClassroomStore();
  const { teachers } = useTeacherStore();
  const { bookings, createBooking, checkIn, getActiveBookingsByCourse, getBookingsByCourse } = useBookingStore();
  const { students } = useStudentStore();
  const { waitlists } = useWaitlistStore();

  const [classroomModalOpen, setClassroomModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<string | null>(null);
  const [classroomForm, setClassroomForm] = useState<ClassroomFormData>({
    name: '', capacity: 10, equipment: [], calligraphyStyles: [], isActive: true,
  });

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<CourseFormData>({
    title: '', classroomId: '', teacherId: '', style: '楷书',
    date: formatDate(new Date()), startTime: '09:00', endTime: '11:00', maxStudents: 10,
  });

  const [courseDetailOpen, setCourseDetailOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      checkAndReleaseBookings();
      forceUpdate((n) => n + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const weekDays = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    const dayOfWeek = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: formatDate(d),
        label: dayLabels[i],
        dayNum: d.getDate(),
        isToday: formatDate(d) === formatDate(new Date()),
      };
    });
  }, [weekOffset]);

  const weekCourses = useMemo(() => {
    const startDate = weekDays[0].date;
    const endDate = weekDays[6].date;
    return courses.filter((c) => c.date >= startDate && c.date <= endDate);
  }, [courses, weekDays]);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const selectedCourseAllBookings = useMemo(() => {
    if (!selectedCourse) return [];
    return getBookingsByCourse(selectedCourse.id);
  }, [selectedCourse, getBookingsByCourse]);

  const selectedCourseWaitlistFilled = useMemo(() => {
    if (!selectedCourse) return [];
    return waitlists.filter((w) => w.courseId === selectedCourse.id && w.status === '已补位');
  }, [selectedCourse, waitlists]);

  const courseStats = useMemo(() => {
    if (!selectedCourse) return { booked: 0, checkedIn: 0, timeoutReleased: 0, waitlistFilled: 0 };
    return {
      booked: selectedCourseAllBookings.filter((b) => b.status === '已预约').length,
      checkedIn: selectedCourseAllBookings.filter((b) => b.status === '已签到').length,
      timeoutReleased: selectedCourseAllBookings.filter((b) => b.status === '超时释放').length,
      waitlistFilled: selectedCourseWaitlistFilled.length,
    };
  }, [selectedCourse, selectedCourseAllBookings, selectedCourseWaitlistFilled]);

  const getTabBookings = useMemo(() => {
    switch (courseDetailTab) {
      case 'booked':
        return selectedCourseAllBookings.filter((b) => b.status === '已预约');
      case 'checked_in':
        return selectedCourseAllBookings.filter((b) => b.status === '已签到');
      case 'timeout_released':
        return selectedCourseAllBookings.filter((b) => b.status === '超时释放');
      default:
        return [];
    }
  }, [courseDetailTab, selectedCourseAllBookings]);

  const getCourseColor = (style: string) =>
    STYLE_COLORS[style] || STYLE_COLORS['楷书'];

  const getCourseSlotIndices = (startTime: string, endTime: string) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const startIdx = Math.max(0, Math.floor((startHour - 9) / 2));
    const endIdx = Math.min(TIME_SLOTS.length - 1, Math.ceil((endHour - 9) / 2));
    return { startIdx, endIdx, span: Math.max(1, endIdx - startIdx) };
  };

  const openNewCourseModal = (date?: string, time?: string) => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      classroomId: classrooms[0]?.id || '',
      teacherId: teachers[0]?.id || '',
      style: '楷书',
      date: date || formatDate(new Date()),
      startTime: time || '09:00',
      endTime: time ? `${parseInt(time.split(':')[0]) + 2}:00` : '11:00',
      maxStudents: 10,
    });
    setCourseModalOpen(true);
  };

  const openEditCourseModal = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    setEditingCourse(courseId);
    setCourseForm({
      title: course.title,
      classroomId: course.classroomId,
      teacherId: course.teacherId,
      style: course.style,
      date: course.date,
      startTime: course.startTime,
      endTime: course.endTime,
      maxStudents: course.maxStudents,
    });
    setCourseModalOpen(true);
  };

  const openNewClassroomModal = () => {
    setEditingClassroom(null);
    setClassroomForm({ name: '', capacity: 10, equipment: [], calligraphyStyles: [], isActive: true });
    setClassroomModalOpen(true);
  };

  const openEditClassroomModal = (classroomId: string) => {
    const classroom = classrooms.find((c) => c.id === classroomId);
    if (!classroom) return;
    setEditingClassroom(classroomId);
    setClassroomForm({
      name: classroom.name,
      capacity: classroom.capacity,
      equipment: [...classroom.equipment],
      calligraphyStyles: [...classroom.calligraphyStyles],
      isActive: classroom.isActive,
    });
    setClassroomModalOpen(true);
  };

  const handleClassroomSubmit = () => {
    if (!classroomForm.name.trim()) return;
    if (editingClassroom) {
      updateClassroom(editingClassroom, classroomForm);
    } else {
      addClassroom(classroomForm);
    }
    setClassroomModalOpen(false);
  };

  const handleCourseSubmit = () => {
    if (!courseForm.title.trim() || !courseForm.classroomId || !courseForm.teacherId) return;
    const data = {
      ...courseForm,
      status: '待开课' as const,
    };
    if (editingCourse) {
      const { ...patch } = data;
      useCourseStore.getState().updateCourse(editingCourse, patch);
    } else {
      addCourse(data);
    }
    setCourseModalOpen(false);
  };

  const handleCheckIn = (bookingId: string) => {
    checkIn(bookingId);
    forceUpdate((n) => n + 1);
  };

  const getTimeoutRemaining = (bookedAt: string, timeoutMinutes: number) => {
    const booked = new Date(bookedAt.replace(' ', 'T'));
    const timeout = new Date(booked.getTime() + timeoutMinutes * 60 * 1000);
    const now = new Date();
    const remaining = Math.max(0, timeout.getTime() - now.getTime());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return { minutes, seconds, expired: remaining <= 0 };
  };

  const toggleEquipment = (eq: string) => {
    setClassroomForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((e) => e !== eq)
        : [...prev.equipment, eq],
    }));
  };

  const toggleStyle = (style: string) => {
    setClassroomForm((prev) => ({
      ...prev,
      calligraphyStyles: prev.calligraphyStyles.includes(style)
        ? prev.calligraphyStyles.filter((s) => s !== style)
        : [...prev.calligraphyStyles, style],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink font-serif">课程排期</h1>
          <p className="mt-1 text-sm text-ink/60">管理课程安排与教室资源</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'calendar' ? (
            <button
              onClick={() => openNewCourseModal()}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              <Plus className="h-4 w-4" />
              新建课程
            </button>
          ) : (
            <button
              onClick={openNewClassroomModal}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              <Plus className="h-4 w-4" />
              新建教室
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 rounded-xl bg-ink/5 p-1 w-fit">
        <button
          onClick={() => setActiveTab('calendar')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            activeTab === 'calendar'
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink/60 hover:text-ink'
          )}
        >
          <CalendarDays className="h-4 w-4" />
          排期日历
        </button>
        <button
          onClick={() => setActiveTab('classroom')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            activeTab === 'classroom'
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink/60 hover:text-ink'
          )}
        >
          <Building2 className="h-4 w-4" />
          教室管理
        </button>
      </div>

      {activeTab === 'classroom' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="group relative rounded-2xl border border-ink/10 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rice text-ink">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{classroom.name}</h3>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-ink/50">
                      <Users className="h-3 w-3" />
                      容量 {classroom.capacity} 人
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditClassroomModal(classroom.id)}
                    className="rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteClassroom(classroom.id)}
                    className="rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-cinnabar/10 hover:text-cinnabar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-ink/40">适配书体</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {classroom.calligraphyStyles.length > 0 ? (
                    classroom.calligraphyStyles.map((style) => {
                      const color = getCourseColor(style);
                      return (
                        <span
                          key={style}
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                            color.bg,
                            color.text
                          )}
                        >
                          {style}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-ink/30">未设置</span>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-ink/40">教室设备</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {classroom.equipment.slice(0, 4).map((eq) => (
                    <span
                      key={eq}
                      className="inline-flex items-center rounded-md bg-ink/5 px-2 py-0.5 text-xs text-ink/60"
                    >
                      {eq}
                    </span>
                  ))}
                  {classroom.equipment.length > 4 && (
                    <span className="inline-flex items-center rounded-md bg-ink/5 px-2 py-0.5 text-xs text-ink/40">
                      +{classroom.equipment.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-3">
                <span className="text-xs text-ink/50">
                  {classroom.isActive ? '启用中' : '已停用'}
                </span>
                <button
                  onClick={() => toggleActive(classroom.id)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                    classroom.isActive ? 'bg-bamboo' : 'bg-ink/20'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                      classroom.isActive ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-ink/10 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWeekOffset((o) => o - 1)}
                className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-medium text-ink">
                {weekDays[0].date} ~ {weekDays[6].date}
              </span>
              <button
                onClick={() => setWeekOffset((o) => o + 1)}
                className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setWeekOffset(0)}
              className="text-sm text-ink/60 transition-colors hover:text-ink"
            >
              回到本周
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="flex border-b border-ink/10">
                <div className="w-20 shrink-0" />
                {weekDays.map((day) => (
                  <div
                    key={day.date}
                    className={cn(
                      'flex-1 border-l border-ink/5 px-2 py-3 text-center',
                      day.isToday && 'bg-rice/50'
                    )}
                  >
                    <div className="text-xs text-ink/50">周{day.label}</div>
                    <div
                      className={cn(
                        'mt-1 text-lg font-semibold',
                        day.isToday ? 'text-cinnabar' : 'text-ink'
                      )}
                    >
                      {day.dayNum}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                {TIME_SLOTS.slice(0, -1).map((_, slotIdx) => (
                  <div key={slotIdx} className="flex border-b border-ink/5 last:border-b-0">
                    <div className="w-20 shrink-0 border-r border-ink/5 px-2 py-4 text-right text-xs text-ink/40">
                      {TIME_SLOTS[slotIdx]}
                      <div className="mt-0.5 text-[10px] opacity-60">
                        - {TIME_SLOTS[slotIdx + 1]}
                      </div>
                    </div>
                    {weekDays.map((day) => {
                      const dayCourses = weekCourses.filter((c) => c.date === day.date);
                      return (
                        <div
                          key={`${day.date}-${slotIdx}`}
                          className={cn(
                            'group relative flex-1 border-l border-ink/5 p-1.5 min-h-[72px]',
                            'hover:bg-ink/[0.02] cursor-pointer transition-colors'
                          )}
                          onClick={() => {
                            const existingCourse = dayCourses.find((c) => {
                              const { startIdx, endIdx } = getCourseSlotIndices(c.startTime, c.endTime);
                              return slotIdx >= startIdx && slotIdx < endIdx;
                            });
                            if (existingCourse) {
                              setSelectedCourseId(existingCourse.id);
                              setCourseDetailOpen(true);
                            } else {
                              openNewCourseModal(day.date, TIME_SLOTS[slotIdx]);
                            }
                          }}
                        >
                          {dayCourses.map((course) => {
                          const { startIdx, span } = getCourseSlotIndices(
                            course.startTime, course.endTime
                          );
                          if (slotIdx !== startIdx) return null;
                          const color = getCourseColor(course.style);
                          const bookingCount = getActiveBookingsByCourse(course.id).length;
                          return (
                            <div
                              key={course.id}
                              className={cn(
                                'relative rounded-lg p-2 text-white shadow-sm overflow-hidden',
                                'transition-all hover:shadow-md cursor-pointer z-10',
                                color.bg,
                                color.hover
                              )}
                              style={{ height: `${span * 72 - 12}px` }}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const parentRect = e.currentTarget.closest('.min-w-\\[800px\\,\\[800px')?.getBoundingClientRect();
                                setHoveredCourse(course.id);
                                setHoverPos({
                                  x: rect.left - (parentRect?.left || 0) + rect.width + 8,
                                  y: rect.top - (parentRect?.top || 0),
                                });
                              }}
                              onMouseLeave={() => setHoveredCourse(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCourseId(course.id);
                                setCourseDetailOpen(true);
                              }}
                            >
                              <div className="truncate text-sm font-semibold">
                                {course.title}
                              </div>
                              <div className="mt-0.5 truncate text-xs opacity-80">
                                {course.startTime}-{course.endTime}
                              </div>
                              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] opacity-90">
                                <span className="flex items-center gap-0.5">
                                  <Users className="h-3 w-3" />
                                  {bookingCount}/{course.maxStudents}
                                </span>
                                <StatusBadge
                                  status={
                                    course.status === '进行中' ? 'booked' :
                                    course.status === '已结束' ? 'completed' : 'waiting'
                                  }
                                  showIcon={false}
                                  className="!bg-white/20 !text-white !border-white/30"
                                />
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {hoveredCourse && (() => {
                  const course = courses.find((c) => c.id === hoveredCourse);
                  if (!course) return null;
                  const teacher = teachers.find((t) => t.id === course.teacherId);
                  const bookingCount = getActiveBookingsByCourse(course.id).length;
                  const classroom = classrooms.find((c) => c.id === course.classroomId);
                  return (
                    <div
                      className="pointer-events-none absolute z-50 w-56 rounded-xl border border-ink/10 bg-white p-3 shadow-xl"
                      style={{ left: hoverPos.x, top: hoverPos.y }}
                    >
                      <div className="font-semibold text-ink">{course.title}</div>
                      <div className="mt-1 text-xs text-ink/60">
                        {course.startTime} - {course.endTime}
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-ink/70">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-ink/40" />
                          老师：{teacher?.name || '未分配'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-ink/40" />
                          教室：{classroom?.name || '未设置'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-ink/40" />
                          预约：{bookingCount} / {course.maxStudents} 人
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={classroomModalOpen}
        onClose={() => setClassroomModalOpen(false)}
        title={editingClassroom ? '编辑教室' : '新建教室'}
        footer={
          <>
            <button
              onClick={() => setClassroomModalOpen(false)}
              className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5"
            >
              取消
            </button>
            <button
              onClick={handleClassroomSubmit}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              {editingClassroom ? '保存' : '创建'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              教室名称
            </label>
            <input
              type="text"
              value={classroomForm.name}
              onChange={(e) =>
                setClassroomForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="如：墨韵轩"
              className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              容纳人数
            </label>
            <input
              type="number"
              min={1}
              value={classroomForm.capacity}
              onChange={(e) =>
                setClassroomForm((p) => ({
                  ...p,
                  capacity: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              适配书体
            </label>
            <div className="flex flex-wrap gap-2">
              {CALLIGRAPHY_STYLES.map((style) => {
                const selected = classroomForm.calligraphyStyles.includes(style);
                const color = getCourseColor(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      selected
                        ? `${color.bg} ${color.text} shadow-sm`
                        : 'border border-ink/10 bg-white text-ink/60 hover:bg-ink/5'
                    )}
                  >
                    {selected && <Check className="h-3 w-3" />}
                    {style}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              教室设备
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_EQUIPMENT_OPTIONS.map((eq) => {
                const selected = classroomForm.equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquipment(eq)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-all',
                      selected
                        ? 'bg-bamboo text-white shadow-sm'
                        : 'border border-ink/10 bg-white text-ink/60 hover:bg-ink/5'
                    )}
                  >
                    {selected && <Check className="h-3 w-3" />}
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-rice/50 p-3">
            <div>
              <p className="text-sm font-medium text-ink">启用状态</p>
              <p className="text-xs text-ink/50">关闭后将无法在此教室排课</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setClassroomForm((p) => ({ ...p, isActive: !p.isActive }))
              }
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                classroomForm.isActive ? 'bg-bamboo' : 'bg-ink/20'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                  classroomForm.isActive ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={editingCourse ? '编辑课程' : '新建课程'}
        footer={
          <>
            <button
              onClick={() => setCourseModalOpen(false)}
              className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5"
            >
              取消
            </button>
            <button
              onClick={handleCourseSubmit}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              {editingCourse ? '保存' : '创建'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              课程名称
            </label>
            <input
              type="text"
              value={courseForm.title}
              onChange={(e) =>
                setCourseForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="如：楷书基础班"
              className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">
                授课老师
              </label>
              <select
                value={courseForm.teacherId}
                onChange={(e) =>
                  setCourseForm((p) => ({ ...p, teacherId: e.target.value }))
                }
                className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">
                书体
              </label>
              <select
                value={courseForm.style}
                onChange={(e) =>
                  setCourseForm((p) => ({ ...p, style: e.target.value }))
                }
                className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
              >
                {CALLIGRAPHY_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              上课教室
            </label>
            <select
              value={courseForm.classroomId}
              onChange={(e) =>
                setCourseForm((p) => ({ ...p, classroomId: e.target.value }))
              }
              className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
            >
              {classrooms.filter((c) => c.isActive).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}（{c.capacity}人）
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              上课日期
            </label>
            <input
              type="date"
              value={courseForm.date}
              onChange={(e) =>
                setCourseForm((p) => ({ ...p, date: e.target.value }))
              }
              className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">
                开始时间
              </label>
              <input
                type="time"
                value={courseForm.startTime}
                onChange={(e) =>
                  setCourseForm((p) => ({ ...p, startTime: e.target.value }))
                }
                className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">
                结束时间
              </label>
              <input
                type="time"
                value={courseForm.endTime}
                onChange={(e) =>
                  setCourseForm((p) => ({ ...p, endTime: e.target.value }))
                }
                className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              最大人数
            </label>
            <input
              type="number"
              min={1}
              value={courseForm.maxStudents}
              onChange={(e) =>
                setCourseForm((p) => ({
                  ...p,
                  maxStudents: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full rounded-xl border border-ink/10 bg-rice/50 px-4 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={courseDetailOpen}
        onClose={() => setCourseDetailOpen(false)}
        title={selectedCourse?.title || '课程详情'}
        className="max-w-2xl"
      >
        {selectedCourse && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-rice/50 p-4">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl text-white',
                  getCourseColor(selectedCourse.style).bg
                )}
              >
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-ink">
                  {selectedCourse.title}
                </h3>
                <p className="mt-0.5 text-sm text-ink/60">
                  {selectedCourse.date} {selectedCourse.startTime} - {selectedCourse.endTime}
                </p>
              </div>
              <StatusBadge
                status={
                  selectedCourse.status === '进行中' ? 'booked' :
                  selectedCourse.status === '已结束' ? 'completed' : 'waiting'
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-ink/10 bg-white p-3">
                <p className="text-xs text-ink/50">授课老师</p>
                <p className="mt-1 font-medium text-ink">
                  {teachers.find((t) => t.id === selectedCourse.teacherId)?.name || '未分配'}
                </p>
              </div>
              <div className="rounded-xl border border-ink/10 bg-white p-3">
                <p className="text-xs text-ink/50">上课教室</p>
                <p className="mt-1 font-medium text-ink">
                  {classrooms.find((c) => c.id === selectedCourse.classroomId)?.name || '未设置'}
                </p>
              </div>
              <div className="rounded-xl border border-ink/10 bg-white p-3">
                <p className="text-xs text-ink/50">预约情况</p>
                <p className="mt-1 font-medium text-ink">
                  {courseStats.booked + courseStats.checkedIn} / {selectedCourse.maxStudents} 人
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setCourseDetailTab('booked')}
                className={cn(
                  'rounded-xl border p-3 text-center transition-all',
                  courseDetailTab === 'booked'
                    ? 'border-cinnabar bg-cinnabar/5'
                    : 'border-ink/10 bg-white hover:bg-ink/5'
                )}
              >
                <p className="text-2xl font-bold text-ink">{courseStats.booked}</p>
                <p className="mt-0.5 text-xs text-ink/50">已预约</p>
              </button>
              <button
                onClick={() => setCourseDetailTab('checked_in')}
                className={cn(
                  'rounded-xl border p-3 text-center transition-all',
                  courseDetailTab === 'checked_in'
                    ? 'border-bamboo bg-bamboo/5'
                    : 'border-ink/10 bg-white hover:bg-ink/5'
                )}
              >
                <p className="text-2xl font-bold text-ink">{courseStats.checkedIn}</p>
                <p className="mt-0.5 text-xs text-ink/50">已签到</p>
              </button>
              <button
                onClick={() => setCourseDetailTab('timeout_released')}
                className={cn(
                  'rounded-xl border p-3 text-center transition-all',
                  courseDetailTab === 'timeout_released'
                    ? 'border-cinnabar bg-cinnabar/5'
                    : 'border-ink/10 bg-white hover:bg-ink/5'
                )}
              >
                <p className="text-2xl font-bold text-ink">{courseStats.timeoutReleased}</p>
                <p className="mt-0.5 text-xs text-ink/50">超时释放</p>
              </button>
              <button
                onClick={() => setCourseDetailTab('waitlist_filled')}
                className={cn(
                  'rounded-xl border p-3 text-center transition-all',
                  courseDetailTab === 'waitlist_filled'
                    ? 'border-bamboo bg-bamboo/5'
                    : 'border-ink/10 bg-white hover:bg-ink/5'
                )}
              >
                <p className="text-2xl font-bold text-ink">{courseStats.waitlistFilled}</p>
                <p className="mt-0.5 text-xs text-ink/50">已补位</p>
              </button>
            </div>

            <div>
              <div className="mb-2.5 flex items-center gap-1 rounded-xl bg-ink/5 p-1">
                <button
                  onClick={() => setCourseDetailTab('booked')}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    courseDetailTab === 'booked'
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink/60 hover:text-ink'
                  )}
                >
                  已预约 ({courseStats.booked})
                </button>
                <button
                  onClick={() => setCourseDetailTab('checked_in')}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    courseDetailTab === 'checked_in'
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink/60 hover:text-ink'
                  )}
                >
                  已签到 ({courseStats.checkedIn})
                </button>
                <button
                  onClick={() => setCourseDetailTab('timeout_released')}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    courseDetailTab === 'timeout_released'
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink/60 hover:text-ink'
                  )}
                >
                  超时释放 ({courseStats.timeoutReleased})
                </button>
                <button
                  onClick={() => setCourseDetailTab('waitlist_filled')}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    courseDetailTab === 'waitlist_filled'
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink/60 hover:text-ink'
                  )}
                >
                  已补位 ({courseStats.waitlistFilled})
                </button>
              </div>

              <div className="space-y-2">
                {courseDetailTab !== 'waitlist_filled' ? (
                  getTabBookings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-ink/10 p-6 text-center text-sm text-ink/40">
                      暂无数据
                    </div>
                  ) : (
                    getTabBookings.map((booking) => {
                      const student = students.find((s) => s.id === booking.studentId);
                      const timeout = booking.status === '已预约'
                        ? getTimeoutRemaining(booking.bookedAt, booking.timeoutMinutes)
                        : null;
                      return (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between rounded-xl border border-ink/10 bg-white p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar name={student?.name || ''} size="md" />
                            <div>
                              <p className="font-medium text-ink">
                                {student?.name || '未知学员'}
                              </p>
                              <p className="text-xs text-ink/50">
                                {student?.level} · {student?.targetStyles.join('、')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {timeout && !timeout.expired && (
                              <div className="flex items-center gap-1.5 rounded-lg bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
                                <Timer className="h-3.5 w-3.5" />
                                {timeout.minutes}:{timeout.seconds.toString().padStart(2, '0')}
                              </div>
                            )}
                            {timeout && timeout.expired && (
                              <div className="flex items-center gap-1.5 rounded-lg bg-cinnabar/10 px-2.5 py-1 text-xs font-medium text-cinnabar">
                                <AlertCircle className="h-3.5 w-3.5" />
                                即将释放
                              </div>
                            )}
                            <StatusBadge
                              status={
                                booking.status === '已签到' ? 'checked_in' :
                                booking.status === '超时释放' ? 'timeout_released' : 'booked'
                              }
                            />
                            {booking.status === '已预约' && (
                              <button
                                onClick={() => handleCheckIn(booking.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-bamboo px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-bamboo/90"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                签到
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  selectedCourseWaitlistFilled.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-ink/10 p-6 text-center text-sm text-ink/40">
                      暂无补位学员
                    </div>
                  ) : (
                    selectedCourseWaitlistFilled.map((waitlist) => {
                      const student = students.find((s) => s.id === waitlist.studentId);
                      return (
                        <div
                          key={waitlist.id}
                          className="flex items-center justify-between rounded-xl border border-ink/10 bg-white p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar name={student?.name || ''} size="md" />
                            <div>
                              <p className="font-medium text-ink">
                                {student?.name || '未知学员'}
                              </p>
                              <p className="text-xs text-ink/50">
                                {student?.level} · {student?.targetStyles.join('、')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-ink/50">
                              加入时间：{waitlist.joinedAt}
                            </span>
                            <StatusBadge status="checked_in" />
                          </div>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
