"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  NOTIFICATION_ROUTES,
  NotificationTypeNav,
} from "@/types/notification.types";
import { Notification } from "@/types/notification.types";

export function useNotificationNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (notification: Notification) => {
      const type = notification.type as NotificationTypeNav;
      const resolver = NOTIFICATION_ROUTES[type];

      if (!resolver) return;

      const { path, query } = resolver(notification);

      const qs = query ? `?${new URLSearchParams(query)}` : "";
      const target = `${path}${qs}`;

      const isSamePath = pathname === path;

      if (isSamePath) {
        router.replace(target);
      } else {
        router.push(target);
      }
    },
    [router, pathname, searchParams],
  );
}
