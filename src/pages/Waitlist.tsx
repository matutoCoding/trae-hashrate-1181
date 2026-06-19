import { useState, useMemo, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Bell,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  User,
  Megaphone,
  Handshake,
  Star,
  Settings,
  Clock,
  Trash2,
  Plus,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWaitlistStore } from '@/stores/waitlist';
import { useNotificationStore } from '@/stores/notification';
import { useBookingStore } from '@/stores/booking';
import { useCourseStore } from '@/stores/course';
import { useTeacherStore } from '@/stores/teacher';
import { useStudentStore } from '@/stores/student';
import Avatar from '@/components/Avatar';
import Modal from '@/components/Modal';
import type { Waitlist, Notification, Student, Course } from '@/mock/data';

const positionStyles: Record<number, string> = {
  1: 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 text-white shadow-md shadow-gold/30',
  2: 'bg-gradient-to-br from-gray-200 via-gray-400 to-gray-500 text-white shadow-md shadow-ink/20',
  3: 'bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 text-white shadow-md shadow-amber/30',
};

const notificationTypeConfig: Record<
  Notification['type'],
  { icon: typeof Bell; color: string; bg: string }
> = {
  系统: { icon: Settings, color: 'text-ink', bg: 'bg-ink/10' },
  补位: { icon: Megaphone, color: 'text-cinnabar', bg: 'bg-cinnabar/10' },
  撮合: { icon: Handshake, color: 'text-bamboo', bg: 'bg-bamboo/10' },
  作品: { icon: Star, color: 'text-gold', bg: 'bg-gold/10' },
};

function PositionBadge({ position }: { position: number }) {
  const style =
    positionStyles[position] ||
    'bg-ink/10 text-ink/60 border border-ink/15';
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums',
        style
      )}
    >
      {position}
    </span>
  );
}

function WaitDurationBar({ joinedAt }: { joinedAt: string }) {
  const now = new Date().getTime();
  const joined = new Date(joinedAt.replace(' ', 'T')).getTime();
  const hours = (now - joined) / (1000 * 60 * 60);
  const maxHours = 48;
  const percent = Math.min((hours / maxHours) * 100, 100);

  const getColor = (p: number) => {
    if (p < 25) return 'from-bamboo/60 to-bamboo';
    if (p < 50) return 'from-gold/60 to-gold';
    if (p < 75) return 'from-orange-400/60 to-orange-500';
    return 'from-cinnabar/70 to-cinnabar';
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-ink/50">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          等待时长
        </span>
        <span className="font-medium tabular-nums">
          {hours < 1
            ? `${Math.round(hours * 60)} 分钟`
            : `${hours.toFixed(1)} 小时`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink/5">
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
            getColor(percent)
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function WaitlistItem({
  item,
  student,
  onNotify,
  onCancel,
}: {
  item: Waitlist;
  student: Student;
  onNotify: () => void;
  onCancel: () => void;
}) {
  const canNotify = item.status === '等待中';
  const isNotified = item.status === '已通知';

  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink/8 bg-white p-4 transition-all hover:border-ink/15 hover:shadow-sm">
      <PositionBadge position={item.position} />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={student.name} size="sm" className="border-2 border-white shadow-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {student.name}
              </p>
              <p className="text-xs text-ink/50">
                {student.level} · 目标：{student.targetStyles.join('、')}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
              isNotified
                ? 'bg-gold/15 text-gold'
                : canNotify
                ? 'bg-bamboo/10 text-bamboo'
                : item.status === '已补位'
                ? 'bg-bamboo/15 text-bamboo'
                : 'bg-ink/10 text-ink/50'
            )}
          >
            {item.status}
          </span>
        </div>
        <WaitDurationBar joinedAt={item.joinedAt} />
        <div className="flex gap-2 pt-1">
          {canNotify && (
            <button
              onClick={onNotify}
              className="flex items-center gap-1.5 rounded-lg bg-cinnabar px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-cinnabar/90 active:scale-[0.98]"
            >
              <Megaphone className="h-3.5 w-3.5" />
              发送补位通知
            </button>
          )}
          {isNotified && (
            <button
              onClick={onNotify}
              className="flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-all hover:bg-gold/15"
            >
              <Bell className="h-3.5 w-3.5" />
              重新通知
            </button>
          )}
          {(canNotify || isNotified) && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs font-medium text-ink/60 transition-all hover:border-cinnabar/30 hover:bg-cinnabar/5 hover:text-cinnabar"
            >
              <Trash2 className="h-3.5 w-3.5" />
              取消候补
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const CourseGroup = forwardRef<
  HTMLDivElement,
  {
    course: Course;
    teacherName: string;
    waitlists: Waitlist[];
    expanded: boolean;
    onToggle: () => void;
    students: Record<string, Student>;
    onNotify: (id: string) => void;
    onCancel: (id: string) => void;
  }
>(function CourseGroup(
  {
    course,
    teacherName,
    waitlists,
    expanded,
    onToggle,
    students,
    onNotify,
    onCancel,
  },
  ref
) {
  const activeCount = waitlists.filter(
    (w) => w.status === '等待中' || w.status === '已通知'
  ).length;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 bg-gradient-to-r from-rice/80 to-white px-5 py-4 text-left transition-all hover:from-rice"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="truncate text-base font-bold text-ink">
              {course.title}
            </h3>
            <span className="shrink-0 rounded-md bg-bamboo/10 px-2 py-0.5 text-xs font-medium text-bamboo">
              {course.style}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink/55 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {course.date} {course.startTime}-{course.endTime}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {teacherName}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-cinnabar/10 px-3 py-1 text-xs font-semibold text-cinnabar">
            <Users className="h-3.5 w-3.5" />
            候补 {activeCount} 人
          </span>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-ink/40" />
          ) : (
            <ChevronDown className="h-5 w-5 text-ink/40" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="space-y-3 border-t border-ink/8 bg-white/60 p-4">
          {waitlists.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink/40">
              暂无候补学员
            </div>
          ) : (
            waitlists.map((w) => {
              const student = students[w.studentId];
              if (!student) return null;
              return (
                <WaitlistItem
                  key={w.id}
                  item={w}
                  student={student}
                  onNotify={() => onNotify(w.id)}
                  onCancel={() => onCancel(w.id)}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

function NotificationItem({
  notification,
  onConfirm,
  onReject,
  onRead,
  onClick,
  showActions,
}: {
  notification: Notification;
  onConfirm?: () => void;
  onReject?: () => void;
  onRead: () => void;
  onClick?: () => void;
  showActions: boolean;
}) {
  const config = notificationTypeConfig[notification.type];
  const Icon = config.icon;
  const isWaitlist = notification.type === '补位';

  const handleClick = () => {
    onRead();
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'rounded-xl border p-4 transition-all cursor-pointer',
        notification.isRead
          ? 'border-ink/8 bg-white/70'
          : 'border-cinnabar/20 bg-cinnabar/[0.03] shadow-sm'
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            config.bg
          )}
        >
          <Icon className={cn('h-4.5 w-4.5', config.color)} />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'text-sm font-semibold truncate',
                notification.isRead ? 'text-ink/80' : 'text-ink'
              )}
            >
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cinnabar" />
            )}
          </div>
          <p className="text-xs leading-relaxed text-ink/60 line-clamp-2">
            {notification.content}
          </p>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs text-ink/40">{notification.createdAt}</span>
            {isWaitlist && showActions && (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={onConfirm}
                  className="flex items-center gap-1 rounded-lg bg-bamboo px-2.5 py-1 text-xs font-medium text-white transition-all hover:bg-bamboo/90 active:scale-[0.98]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  确认补位
                </button>
                <button
                  onClick={onReject}
                  className="flex items-center gap-1 rounded-lg border border-ink/15 bg-white px-2.5 py-1 text-xs font-medium text-ink/60 transition-all hover:border-cinnabar/30 hover:text-cinnabar"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  拒绝
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type WaitTimeFilter = 'all' | '1h' | '24h' | '3d';
type NotificationFilter = '全部' | '补位' | '系统' | '撮合';

export default function Waitlist() {
  const navigate = useNavigate();
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );
  const [registerModal, setRegisterModal] = useState(false);
  const [registerCourseId, setRegisterCourseId] = useState('');
  const [registerStudentId, setRegisterStudentId] = useState('');
  const [waitTimeFilter, setWaitTimeFilter] = useState<WaitTimeFilter>('all');
  const [notificationFilter, setNotificationFilter] =
    useState<NotificationFilter>('全部');
  const courseRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const waitlists = useWaitlistStore((s) => s.waitlists);
  const joinWaitlist = useWaitlistStore((s) => s.joinWaitlist);
  const notifyFirstInLine = useWaitlistStore((s) => s.notifyFirstInLine);
  const confirmWaitlistEntry = useWaitlistStore(
    (s) => s.confirmWaitlistEntry
  );
  const leaveWaitlist = useWaitlistStore((s) => s.leaveWaitlist);
  const skipWaitlistEntry = useWaitlistStore((s) => s.skipWaitlistEntry);
  const batchCancelInvalidWaitlists = useWaitlistStore(
    (s) => s.batchCancelInvalidWaitlists
  );
  const getWaitlistById = useWaitlistStore((s) => s.getWaitlistById);

  const notifications = useNotificationStore((s) => s.notifications);
  const pushNotification = useNotificationStore((s) => s.pushNotification);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);

  const createBooking = useBookingStore((s) => s.createBooking);
  const isStudentBooked = useBookingStore((s) => s.isStudentBooked);

  const courses = useCourseStore((s) => s.courses);
  const getAvailableSlots = useCourseStore((s) => s.getAvailableSlots);
  const teachers = useTeacherStore((s) => s.teachers);
  const students = useStudentStore((s) => s.students);

  const teacherMap = useMemo(
    () => Object.fromEntries(teachers.map((t) => [t.id, t])),
    [teachers]
  );
  const studentMap = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s])),
    [students]
  );

  const waitlistByCourse = useMemo(() => {
    const now = new Date().getTime();
    const map = new Map<string, Waitlist[]>();
    for (const w of waitlists) {
      if (w.status === '已取消') continue;
      const joinedTime = new Date(w.joinedAt.replace(' ', 'T')).getTime();
      const hoursWaited = (now - joinedTime) / (1000 * 60 * 60);
      const matchesFilter =
        waitTimeFilter === 'all' ||
        (waitTimeFilter === '1h' && hoursWaited <= 1) ||
        (waitTimeFilter === '24h' && hoursWaited <= 24) ||
        (waitTimeFilter === '3d' && hoursWaited >= 72);
      if (!matchesFilter) continue;
      if (!map.has(w.courseId)) map.set(w.courseId, []);
      map.get(w.courseId)!.push(w);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.position - b.position);
    }
    return map;
  }, [waitlists, waitTimeFilter]);

  const sortedNotifications = useMemo(() => {
    const filtered =
      notificationFilter === '全部'
        ? notifications
        : notifications.filter((n) => n.type === notificationFilter);
    return [...filtered].sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return (
        new Date(b.createdAt.replace(' ', 'T')).getTime() -
        new Date(a.createdAt.replace(' ', 'T')).getTime()
      );
    });
  }, [notifications, notificationFilter]);

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const expandAndScrollToCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      next.add(courseId);
      return next;
    });
    setTimeout(() => {
      const el = courseRefs.current.get(courseId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const setCourseRef = (courseId: string, el: HTMLDivElement | null) => {
    if (el) {
      courseRefs.current.set(courseId, el);
    } else {
      courseRefs.current.delete(courseId);
    }
  };

  const handleBatchNotify = () => {
    const courseIdsToNotify = new Set<string>();
    for (const [courseId, courseWaitlists] of waitlistByCourse.entries()) {
      const hasWaiting = courseWaitlists.some((w) => w.status === '等待中');
      const isExpanded = expandedCourses.has(courseId);
      if (isExpanded || hasWaiting) {
        courseIdsToNotify.add(courseId);
      }
    }
    for (const courseId of courseIdsToNotify) {
      const notified = notifyFirstInLine(courseId);
      if (notified) {
        const student = studentMap[notified.studentId];
        const course = courses.find((c) => c.id === notified.courseId);
        if (student && course) {
          pushNotification(
            '补位',
            `${course.title}补位通知`,
            `学员「${student.name}」已被通知补位，请等待学员确认。`,
            notified.id
          );
        }
      }
    }
  };

  const handleBatchCleanup = () => {
    const invalidIds = batchCancelInvalidWaitlists();
    if (invalidIds.length > 0) {
      pushNotification(
        '系统',
        '批量清理完成',
        `已清理 ${invalidIds.length} 条超时未响应的候补记录。`,
      );
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.relatedId) return;
    if (notification.type === '补位') {
      const entry = getWaitlistById(notification.relatedId);
      if (entry) {
        expandAndScrollToCourse(entry.courseId);
      }
    } else if (notification.type === '系统' || notification.type === '撮合') {
      const relatedId = notification.relatedId;
      const course = courses.find((c) => c.id === relatedId);
      if (course) {
        expandAndScrollToCourse(course.id);
        return;
      }
      const matchCourseFromWaitlist = waitlists.find(
        (w) => w.id === relatedId
      );
      if (matchCourseFromWaitlist) {
        expandAndScrollToCourse(matchCourseFromWaitlist.courseId);
      }
    }
  };

  const shouldShowNotificationActions = (notification: Notification) => {
    if (notification.type !== '补位') return false;
    if (notification.isRead) return false;
    if (!notification.relatedId) return false;
    const entry = getWaitlistById(notification.relatedId);
    if (!entry) return false;
    return entry.status === '已通知';
  };

  const handleNotify = (waitlistId: string) => {
    const entry = waitlists.find((w) => w.id === waitlistId);
    if (!entry) return;
    const notified = notifyFirstInLine(entry.courseId);
    if (notified) {
      const student = studentMap[notified.studentId];
      const course = courses.find((c) => c.id === notified.courseId);
      if (student && course) {
        pushNotification(
          '补位',
          `${course.title}补位通知`,
          `学员「${student.name}」已被通知补位，请等待学员确认。`,
          notified.id
        );
      }
    }
  };

  const handleCancel = (waitlistId: string) => {
    leaveWaitlist(waitlistId);
  };

  const handleConfirmNotification = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.relatedId) {
      const entry = waitlists.find((w) => w.id === notification.relatedId);
      if (!entry) return;

      const course = courses.find((c) => c.id === entry.courseId);
      const student = studentMap[entry.studentId];

      const availableSlots = getAvailableSlots(entry.courseId);
      if (availableSlots <= 0) {
        pushNotification(
          '系统',
          '补位失败',
          `「${course?.title || '课程'}」暂无空余名额，补位失败。`,
          entry.id
        );
        return;
      }

      if (isStudentBooked(entry.courseId, entry.studentId)) {
        pushNotification(
          '系统',
          '补位失败',
          `学员「${student?.name || '该学员'}」已预约「${course?.title || '课程'}」，请勿重复预约。`,
          entry.id
        );
        return;
      }

      if (confirmWaitlistEntry(entry.id)) {
        createBooking({
          courseId: entry.courseId,
          studentId: entry.studentId,
        });
        if (student && course) {
          pushNotification(
            '系统',
            '补位成功',
            `学员「${student.name}」已成功补位至「${course.title}」，预约已自动创建。`,
            entry.id
          );
        }
      }
    }
  };

  const handleRejectNotification = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.relatedId) {
      const nextNotified = skipWaitlistEntry(notification.relatedId);
      const entry = waitlists.find((w) => w.id === notification.relatedId);
      if (entry) {
        const student = studentMap[entry.studentId];
        const course = courses.find((c) => c.id === entry.courseId);
        if (student && course) {
          pushNotification(
            '系统',
            '补位已拒绝',
            `学员「${student.name}」已拒绝「${course.title}」的补位通知，已自动通知下一位候补学员。`,
            entry.id
          );
        }
      }
      if (nextNotified) {
        const nextStudent = studentMap[nextNotified.studentId];
        const course = courses.find((c) => c.id === nextNotified.courseId);
        if (nextStudent && course) {
          pushNotification(
            '补位',
            `${course.title}补位通知`,
            `学员「${nextStudent.name}」已被通知补位，请等待学员确认。`,
            nextNotified.id
          );
        }
      }
    }
  };

  const handleOpenRegister = (courseId?: string) => {
    setRegisterCourseId(courseId || '');
    setRegisterStudentId('');
    setRegisterModal(true);
  };

  const handleRegisterSubmit = () => {
    if (!registerCourseId || !registerStudentId) return;

    const result = joinWaitlist(registerCourseId, registerStudentId);
    if (result) {
      const student = studentMap[registerStudentId];
      const course = courses.find((c) => c.id === registerCourseId);
      if (student && course) {
        pushNotification(
          '系统',
          '候补登记成功',
          `学员「${student.name}」已成功加入「${course.title}」的候补队列，当前顺位第 ${result.position} 位。`,
          result.id
        );
        setExpandedCourses((prev) => {
          const next = new Set(prev);
          next.add(registerCourseId);
          return next;
        });
      }
    } else {
      const student = studentMap[registerStudentId];
      const course = courses.find((c) => c.id === registerCourseId);
      if (student && course) {
        pushNotification(
          '系统',
          '候补登记失败',
          `学员「${student.name}」已在「${course.title}」的候补队列中，无需重复登记。`,
          registerCourseId
        );
      }
    }
    setRegisterModal(false);
  };

  const unreadCount = getUnreadCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rice/50 via-white to-rice/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink font-serif">
            候补补位管理
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            管理课程候补队列，处理补位通知与学员反馈
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg font-semibold text-ink">候补队列</h2>
                  <span className="text-xs text-ink/50">
                    共 {waitlistByCourse.size} 个课程有候补
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-2 py-1">
                    <Filter className="h-3.5 w-3.5 text-ink/50" />
                    <select
                      value={waitTimeFilter}
                      onChange={(e) =>
                        setWaitTimeFilter(e.target.value as WaitTimeFilter)
                      }
                      className="bg-transparent text-xs text-ink/70 focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="all">全部</option>
                      <option value="1h">1小时内</option>
                      <option value="24h">24小时内</option>
                      <option value="3d">3天以上</option>
                    </select>
                  </div>
                  <button
                    onClick={handleBatchNotify}
                    className="flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-all hover:bg-gold/15"
                  >
                    <Megaphone className="h-3.5 w-3.5" />
                    一键通知下一位
                  </button>
                  <button
                    onClick={handleBatchCleanup}
                    className="flex items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs font-medium text-ink/60 transition-all hover:border-cinnabar/30 hover:bg-cinnabar/5 hover:text-cinnabar"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    批量清理无效候补
                  </button>
                  <button
                    onClick={() => handleOpenRegister()}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cinnabar to-cinnabar/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm shadow-cinnabar/20 transition-all hover:shadow-md hover:shadow-cinnabar/30 active:scale-[0.98]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    登记候补
                  </button>
                </div>
              </div>
            </div>
            {Array.from(waitlistByCourse.entries()).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 py-16 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-ink/20" />
                <p className="text-sm text-ink/50">暂无候补学员</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(waitlistByCourse.entries()).map(
                  ([courseId, courseWaitlists]) => {
                    const course = courses.find(
                      (c) => c.id === courseId
                    );
                    if (!course) return null;
                    const teacher = teacherMap[course.teacherId];
                    return (
                      <CourseGroup
                        key={courseId}
                        ref={(el) => setCourseRef(courseId, el)}
                        course={course}
                        teacherName={teacher?.name || '未分配'}
                        waitlists={courseWaitlists}
                        expanded={expandedCourses.has(courseId)}
                        onToggle={() => toggleCourse(courseId)}
                        students={studentMap}
                        onNotify={handleNotify}
                        onCancel={handleCancel}
                      />
                    );
                  }
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-ink">
                    通知中心
                  </h2>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-cinnabar px-2 py-0.5 text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    unreadCount > 0
                      ? 'bg-ink/5 text-ink/70 hover:bg-ink/10'
                      : 'bg-ink/[0.03] text-ink/30 cursor-not-allowed'
                  )}
                >
                  全部已读
                </button>
              </div>

              <div className="flex gap-1 rounded-xl bg-ink/[0.04] p-1">
                {(['全部', '补位', '系统', '撮合'] as NotificationFilter[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setNotificationFilter(tab)}
                      className={cn(
                        'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                        notificationFilter === tab
                          ? 'bg-white text-ink shadow-sm'
                          : 'text-ink/50 hover:text-ink/70'
                      )}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              <div className="space-y-3 max-h-[calc(100vh-290px)] overflow-y-auto pr-1">
                {sortedNotifications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 py-16 text-center">
                    <Bell className="mx-auto mb-3 h-12 w-12 text-ink/20" />
                    <p className="text-sm text-ink/50">暂无通知</p>
                  </div>
                ) : (
                  sortedNotifications.map((n, idx) => (
                    <NotificationItem
                      key={`${n.id}-${idx}`}
                      notification={n}
                      onRead={() => !n.isRead && markAsRead(n.id)}
                      onConfirm={() => handleConfirmNotification(n)}
                      onReject={() => handleRejectNotification(n)}
                      onClick={() => handleNotificationClick(n)}
                      showActions={shouldShowNotificationActions(n)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={registerModal}
        onClose={() => setRegisterModal(false)}
        title="登记候补"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setRegisterModal(false)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/60 transition-all hover:bg-ink/5"
            >
              取消
            </button>
            <button
              onClick={handleRegisterSubmit}
              disabled={!registerCourseId || !registerStudentId}
              className={cn(
                'rounded-lg px-5 py-2 text-sm font-medium text-white transition-all',
                registerCourseId && registerStudentId
                  ? 'bg-gradient-to-r from-cinnabar to-cinnabar/90 hover:shadow-md hover:shadow-cinnabar/20 active:scale-[0.98]'
                  : 'bg-ink/20 cursor-not-allowed'
              )}
            >
              确认登记
            </button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              选择课程
            </label>
            <select
              value={registerCourseId}
              onChange={(e) => setRegisterCourseId(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink transition-all focus:border-cinnabar focus:outline-none focus:ring-2 focus:ring-cinnabar/20"
            >
              <option value="">-- 请选择课程 --</option>
              {courses
                .filter((c) => c.status !== '已结束' && c.status !== '已取消')
                .map((course) => {
                  const teacher = teacherMap[course.teacherId];
                  const slots = getAvailableSlots(course.id);
                  return (
                    <option key={course.id} value={course.id}>
                      {course.title} · {course.date} {course.startTime} · {teacher?.name || '未分配'} · {slots > 0 ? `余${slots}位` : '已满'}
                    </option>
                  );
                })}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              选择学员
            </label>
            <select
              value={registerStudentId}
              onChange={(e) => setRegisterStudentId(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink transition-all focus:border-cinnabar focus:outline-none focus:ring-2 focus:ring-cinnabar/20"
            >
              <option value="">-- 请选择学员 --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.level} · 目标：{student.targetStyles.join('、')}
                </option>
              ))}
            </select>
          </div>
          {registerCourseId && (
            <div className="rounded-lg bg-rice/50 border border-rice/60 p-3">
              <p className="text-xs text-ink/60">
                <span className="font-medium text-ink">登记说明：</span>
                加入候补队列后，若有名额释放将按顺位自动通知。
                您可以在「候补队列」中查看当前顺位和等待时长。
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
