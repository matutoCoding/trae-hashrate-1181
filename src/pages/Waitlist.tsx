import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWaitlistStore } from '@/stores/waitlist';
import { useNotificationStore } from '@/stores/notification';
import { useBookingStore } from '@/stores/booking';
import { useCourseStore } from '@/stores/course';
import { useTeacherStore } from '@/stores/teacher';
import { useStudentStore } from '@/stores/student';
import Avatar from '@/components/Avatar';
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

function CourseGroup({
  course,
  teacherName,
  waitlists,
  expanded,
  onToggle,
  students,
  onNotify,
  onCancel,
}: {
  course: Course;
  teacherName: string;
  waitlists: Waitlist[];
  expanded: boolean;
  onToggle: () => void;
  students: Record<string, Student>;
  onNotify: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const activeCount = waitlists.filter(
    (w) => w.status === '等待中' || w.status === '已通知'
  ).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
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
}

function NotificationItem({
  notification,
  onConfirm,
  onReject,
  onRead,
}: {
  notification: Notification;
  onConfirm?: () => void;
  onReject?: () => void;
  onRead: () => void;
}) {
  const config = notificationTypeConfig[notification.type];
  const Icon = config.icon;
  const isWaitlist = notification.type === '补位';

  return (
    <div
      onClick={onRead}
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
            {isWaitlist && !notification.isRead && (
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

export default function Waitlist() {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );

  const waitlists = useWaitlistStore((s) => s.waitlists);
  const notifyFirstInLine = useWaitlistStore((s) => s.notifyFirstInLine);
  const confirmWaitlistEntry = useWaitlistStore(
    (s) => s.confirmWaitlistEntry
  );
  const leaveWaitlist = useWaitlistStore((s) => s.leaveWaitlist);
  const skipWaitlistEntry = useWaitlistStore((s) => s.skipWaitlistEntry);

  const notifications = useNotificationStore((s) => s.notifications);
  const pushNotification = useNotificationStore((s) => s.pushNotification);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);

  const createBooking = useBookingStore((s) => s.createBooking);

  const courses = useCourseStore((s) => s.courses);
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
    const map = new Map<string, Waitlist[]>();
    for (const w of waitlists) {
      if (w.status === '已取消') continue;
      if (!map.has(w.courseId)) map.set(w.courseId, []);
      map.get(w.courseId)!.push(w);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.position - b.position);
    }
    return map;
  }, [waitlists]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return (
        new Date(b.createdAt.replace(' ', 'T')).getTime() -
        new Date(a.createdAt.replace(' ', 'T')).getTime()
      );
    });
  }, [notifications]);

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
      if (entry && confirmWaitlistEntry(entry.id)) {
        createBooking({
          courseId: entry.courseId,
          studentId: entry.studentId,
        });
        const student = studentMap[entry.studentId];
        const course = courses.find((c) => c.id === entry.courseId);
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">候补队列</h2>
              <span className="text-xs text-ink/50">
                共 {waitlistByCourse.size} 个课程有候补
              </span>
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

              <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
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
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
