import { useBookingStore } from '../stores/booking';
import { useWaitlistStore } from '../stores/waitlist';
import { useNotificationStore } from '../stores/notification';
import { useCourseStore } from '../stores/course';

export const timerRef: { current: ReturnType<typeof setInterval> | null } = {
  current: null,
};

export const processWaitlistNotification = (courseId: string): void => {
  const waitlistStore = useWaitlistStore.getState();
  const notificationStore = useNotificationStore.getState();
  const courseStore = useCourseStore.getState();

  const courseWaitlists = waitlistStore.getByCourse(courseId);
  const waitingEntries = courseWaitlists
    .filter((w) => w.status === '等待中')
    .sort((a, b) => a.position - b.position);

  if (waitingEntries.length === 0) return;

  const notified = waitlistStore.notifyFirstInLine(courseId);
  if (!notified) return;

  const course = courseStore.getCourseById(courseId);
  const courseTitle = course?.title || `课程${courseId}`;

  notificationStore.pushNotification(
    '补位',
    `${courseTitle}补位通知`,
    `您已排到${courseTitle}候补队列首位，请在15分钟内确认补位，逾期将自动顺延至下一位。`,
    notified.id
  );
};

export const checkAndReleaseBookings = (): {
  releasedCourseIds: string[];
  releasedBookingIds: string[];
} => {
  const bookingStore = useBookingStore.getState();
  const courseStore = useCourseStore.getState();
  const notificationStore = useNotificationStore.getState();

  const releasedIds = bookingStore.checkAndReleaseTimeoutBookings();
  const releasedCourseIds: string[] = [];

  releasedIds.forEach((bookingId) => {
    const booking = bookingStore.getBookingById(bookingId);
    if (!booking) return;

    if (!releasedCourseIds.includes(booking.courseId)) {
      releasedCourseIds.push(booking.courseId);
    }

    const course = courseStore.getCourseById(booking.courseId);
    const courseTitle = course?.title || `课程${booking.courseId}`;

    notificationStore.pushNotification(
      '系统',
      `${courseTitle}名额释放通知`,
      `学员预约超时未签到，${courseTitle}已释放1个名额，候补队列将自动通知下一位学员。`,
      booking.courseId
    );
  });

  releasedCourseIds.forEach((courseId) => {
    processWaitlistNotification(courseId);
  });

  return {
    releasedCourseIds,
    releasedBookingIds: releasedIds,
  };
};

export const startTimeoutChecker = (intervalMs: number = 10000): void => {
  if (timerRef.current !== null) {
    return;
  }

  checkAndReleaseBookings();

  timerRef.current = setInterval(() => {
    checkAndReleaseBookings();
  }, intervalMs);
};

export const stopTimeoutChecker = (): void => {
  if (timerRef.current !== null) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
};
