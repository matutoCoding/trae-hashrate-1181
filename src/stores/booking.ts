import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Booking, mockBookings } from '../mock/data';

interface BookingState {
  bookings: Booking[];
  createBooking: (data: {
    courseId: string;
    studentId: string;
    timeoutMinutes?: number;
  }) => boolean;
  checkIn: (bookingId: string) => boolean;
  releaseTimeout: (bookingId: string) => boolean;
  cancelBooking: (bookingId: string) => void;
  checkAndReleaseTimeoutBookings: () => string[];
  getBookingsByCourse: (courseId: string) => Booking[];
  getBookingsByStudent: (studentId: string) => Booking[];
  getBookingById: (id: string) => Booking | undefined;
  getActiveBookingsByCourse: (courseId: string) => Booking[];
  getBookingCountByCourse: (courseId: string) => number;
  isStudentBooked: (courseId: string, studentId: string) => boolean;
}

const formatDateTime = (d: Date) =>
  d.toISOString().replace('T', ' ').slice(0, 19);

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: mockBookings,

      createBooking: ({ courseId, studentId, timeoutMinutes = 15 }) => {
        if (get().isStudentBooked(courseId, studentId)) {
          return false;
        }
        const booking: Booking = {
          id: `bkg-${Date.now()}`,
          courseId,
          studentId,
          status: '已预约',
          bookedAt: formatDateTime(new Date()),
          checkInAt: null,
          timeoutMinutes,
        };
        set((state) => ({
          bookings: [...state.bookings, booking],
        }));
        return true;
      },

      checkIn: (bookingId) => {
        const booking = get().getBookingById(bookingId);
        if (!booking || booking.status !== '已预约') {
          return false;
        }
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId
              ? { ...b, status: '已签到', checkInAt: formatDateTime(new Date()) }
              : b
          ),
        }));
        return true;
      },

      releaseTimeout: (bookingId) => {
        const booking = get().getBookingById(bookingId);
        if (!booking || booking.status !== '已预约') {
          return false;
        }
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: '超时释放' } : b
          ),
        }));
        return true;
      },

      cancelBooking: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: '已取消' } : b
          ),
        })),

      checkAndReleaseTimeoutBookings: () => {
        const now = new Date();
        const releasedIds: string[] = [];
        const currentBookings = get().bookings;

        currentBookings.forEach((booking) => {
          if (booking.status !== '已预约') return;
          const bookedAt = new Date(booking.bookedAt.replace(' ', 'T'));
          const timeoutTime = new Date(
            bookedAt.getTime() + booking.timeoutMinutes * 60 * 1000
          );
          if (now >= timeoutTime) {
            releasedIds.push(booking.id);
          }
        });

        if (releasedIds.length > 0) {
          set((state) => ({
            bookings: state.bookings.map((b) =>
              releasedIds.includes(b.id) ? { ...b, status: '超时释放' } : b
            ),
          }));
        }

        return releasedIds;
      },

      getBookingsByCourse: (courseId) =>
        get().bookings.filter((b) => b.courseId === courseId),

      getBookingsByStudent: (studentId) =>
        get().bookings.filter((b) => b.studentId === studentId),

      getBookingById: (id) => get().bookings.find((b) => b.id === id),

      getActiveBookingsByCourse: (courseId) =>
        get().bookings.filter(
          (b) =>
            b.courseId === courseId &&
            (b.status === '已预约' || b.status === '已签到')
        ),

      getBookingCountByCourse: (courseId) =>
        get().getActiveBookingsByCourse(courseId).length,

      isStudentBooked: (courseId, studentId) =>
        get()
          .getActiveBookingsByCourse(courseId)
          .some((b) => b.studentId === studentId),
    }),
    {
      name: 'booking-store',
    }
  )
);
