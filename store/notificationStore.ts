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
        notificationId: String(n.notificationId ?? n.id ?? n._id),
        isRead: Boolean(n.isRead ?? n.read ?? false),
      }));

      const unreadCount =
        typeof data.unread === "number"
          ? data.unread
          : notifications.filter((n) => !n.isRead).length;

      set({
        notifications,
        unreadCount,
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
      const id = String(
        payload.notificationId ??
          (payload as any).id ??
          (payload as any)._id ??
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 9)),
      );

      const newNotification: Notification = {
        ...payload,
        notificationId: id,
        isRead: Boolean(payload.isRead ?? false),
        receivedAt: new Date(),
      };

      const exists = state.notifications.some(
        (n) => n.notificationId === id,
      );
      if (exists) return state;

      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + (newNotification.isRead ? 0 : 1),
      };
    }),

  markAsRead: async (id: string) => {
    if (!id) return;

    // Optimistic local state update
    set((state) => {
      let marked = false;
      const updated = state.notifications.map((n) => {
        const matches =
          n.notificationId === id ||
          (n as any).id === id ||
          (n as any)._id === id;

        if (matches && !n.isRead) {
          marked = true;
          return { ...n, isRead: true };
        }
        return n;
      });

      if (!marked) return state;

      return {
        notifications: updated,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });

    try {
      await api.patch(`/notifications/read/${id}`, {
        skip401Redirect: true,
      });
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
      })),
      unreadCount: 0,
    }));

    try {
      await api.patch("/notifications/read-all", {
        skip401Redirect: true,
      });
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
