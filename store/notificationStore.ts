import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Notification, NotificationPayload } from "@/types/notification.types";
import { api } from "@/lib/axios";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  addNotification: (payload: NotificationPayload) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

// export const useNotificationStore = create<NotificationState>()(

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });

      const response = await api.get("/notifications/all", {
        skip401Redirect: true,
      });

      const data = response.data;
      const raw: any[] = Array.isArray(data)
        ? data
        : (data.notifications ?? []);

      const notifications: Notification[] = raw.map((n) => ({
        ...n,
        isRead: n.isRead ?? n.read ?? false,
      }));

      set({
        notifications,
        unreadCount: data.unread,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error cargando notificaciones:", error);

      set({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
      });
    }
  },

  addNotification: (payload) =>
    set((state) => {
      const newNotification: Notification = {
        ...payload,
        notificationId: payload.notificationId ?? undefined,
        isRead: payload.isRead ?? false,
        receivedAt: new Date(),
      };

      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/read/${id}`, {
        skip401Redirect: true,
      });

      set((state) => {
        const notification = state.notifications.find(
          (n) => n.notificationId === id,
        );

        if (!notification || notification.isRead) {
          return state;
        }

        return {
          notifications: state.notifications.map((n) =>
            n.notificationId === id ? { ...n, isRead: true } : n,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      });
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch("/notifications/read-all", {
        skip401Redirect: true,
      });

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error(
        "Error marcando todas las notificaciones como leídas:",
        error,
      );
    }
  },

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
//   persist(
//     (set) => ({
//       notifications: [],
//       unreadCount: 0,

//       addNotification: (payload) =>
//         set((state) => {
//           const newNotification: Notification = {
//             ...payload,
//             id:
//               typeof crypto !== "undefined" && crypto.randomUUID
//                 ? crypto.randomUUID()
//                 : Math.random().toString(36).substring(2, 9),
//             isRead: false,
//             receivedAt: new Date(),
//           };
//           return {
//             notifications: [newNotification, ...state.notifications],
//             unreadCount: state.unreadCount + 1,
//           };
//         }),

//       markAsRead: (id) =>
//         set((state) => {
//           let decreased = false;
//           const updated = state.notifications.map((n) => {
//             if (n.id === id && !n.isRead) {
//               decreased = true;
//               return { ...n, isRead: true };
//             }
//             return n;
//           });
//           return {
//             notifications: updated,
//             unreadCount: decreased
//               ? state.unreadCount - 1
//               : Math.max(0, state.unreadCount),
//           };
//         }),

//       markAllAsRead: () =>
//         set((state) => ({
//           notifications: state.notifications.map((n) => ({
//             ...n,
//             isRead: true,
//           })),
//           unreadCount: 0,
//         })),

//       clearAll: () => set({ notifications: [], unreadCount: 0 }),
//     }),
//     {
//       name: "avioa-notifications-storage", //Nombre con el que se guardará en el local storage
//       storage: createJSONStorage(() => localStorage),
//     },
//   ),
// );
