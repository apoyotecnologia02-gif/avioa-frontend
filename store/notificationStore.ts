import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Notification, NotificationPayload } from "@/types/notification.types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (payload: NotificationPayload) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (payload) =>
        set((state) => {
          const newNotification: Notification = {
            ...payload,
            id:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 9),
            isRead: false,
            receivedAt: new Date(),
          };
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          };
        }),

      markAsRead: (id) =>
        set((state) => {
          let decreased = false;
          const updated = state.notifications.map((n) => {
            if (n.id === id && !n.isRead) {
              decreased = true;
              return { ...n, isRead: true };
            }
            return n;
          });
          return {
            notifications: updated,
            unreadCount: decreased
              ? state.unreadCount - 1
              : Math.max(0, state.unreadCount),
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
          unreadCount: 0,
        })),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: "avioa-notifications-storage", //Nombre con el que se guardará en el local storage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
