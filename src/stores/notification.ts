import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, mockNotifications } from '../mock/data';

type NotificationType = Notification['type'];

interface NotificationState {
  notifications: Notification[];
  pushNotification: (
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string
  ) => Notification;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getNotificationById: (id: string) => Notification | undefined;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getUnreadNotifications: () => Notification[];
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
}

const formatDateTime = (d: Date) =>
  d.toISOString().replace('T', ' ').slice(0, 19);

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: mockNotifications,

      pushNotification: (type, title, message, relatedId) => {
        const newNotification: Notification = {
          id: `not-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          type,
          title,
          content: message,
          isRead: false,
          createdAt: formatDateTime(new Date()),
          relatedId,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
        return newNotification;
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      getUnreadCount: () =>
        get().notifications.filter((n) => !n.isRead).length,

      getNotificationById: (id) =>
        get().notifications.find((n) => n.id === id),

      getNotificationsByType: (type) =>
        get().notifications.filter((n) => n.type === type),

      getUnreadNotifications: () =>
        get().notifications.filter((n) => !n.isRead),

      clearAllNotifications: () => set(() => ({ notifications: [] })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'notification-store',
    }
  )
);
