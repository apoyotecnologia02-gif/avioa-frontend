import {
  OPEN_LEAVE_REQUESTS_MODAL,
  OPEN_OVERTIME_REQUESTS_MODAL,
} from "@/utils/constants";
import { TeamOvertimeRecord } from "./overtime.types";

export enum NotificationType {
  OVERTIME_REQUEST = "OVERTIME_REQUEST",
  POINT_REQUEST = "POINT_REQUEST",
  POINT_REQUEST_APPROVED = "POINT_REQUEST_APPROVED",
  POINT_REQUEST_REJECTED = "POINT_REQUEST_REJECTED",
  EQUIPMENT_LOAN_REQUEST = "EQUIPMENT_LOAN_REQUEST",
  EQUIPMENT_LOAN_APPROVED = "EQUIPMENT_LOAN_APPROVED",
  EQUIPMENT_LOAN_REJECTED = "EQUIPMENT_LOAN_REJECTED",
  EQUIPMENT_LOAN_RETURNED = "EQUIPMENT_LOAN_RETURNED",
}

export interface PointRequestDetails {
  userId: string;
  userName: string;
  amount: number;
  createdAt: string;
}

export interface NotificationPayload {
  type: NotificationType | string;
  title: string;
  message: string;
  requestId?: string;
  requestDetails?: PointRequestDetails;
  notificationId: string;
  isRead: boolean;
}

export interface AddOvertimeRequestPayload {
  type: NotificationType | string;
  title: string;
  message: string;
  requests: TeamOvertimeRecord[];
  requestId?: string;
  requestDetails?: PointRequestDetails;
}

export interface Notification extends NotificationPayload {
  notificationId: string; // locally generated or backend provided
  isRead: boolean;
  receivedAt: Date;

  /** este id es la entidad relacionada (solicitud, horas extra, ausencia, etcccc) */
  relatedId?: string;
}

export type NotificationTypeNav =
  | "POINT_REQUEST"
  | "POINT_REQUEST_APPROVED"
  | "POINT_REQUEST_REJECTED"
  | "OVERTIME_REQUEST"
  | "OVERTIME_REQUEST_APPROVED"
  | "OVERTIME_REQUEST_REJECTED"
  | "LEAVE_REQUEST_RECEIVED"
  | "LEAVE_REQUEST_APPROVED"
  | "LEAVE_REQUEST_REJECTED"
  | "APPROVAL"
  | "REJECTION";

type RouteTarget = {
  path: string;
  query?: Record<string, string>;
};

export const NOTIFICATION_ROUTES: Record<
  NotificationTypeNav,
  (n: Notification) => RouteTarget
> = {
  POINT_REQUEST: () => ({ path: "/point-request" }),
  POINT_REQUEST_APPROVED: () => ({ path: "/points/my-requests" }),
  POINT_REQUEST_REJECTED: () => ({ path: "/points/my-requests" }),

  // asi se abren los modales
  OVERTIME_REQUEST: (n) => ({
    path: "/overtime",
    query: n.relatedId
      ? { openOvertime: n.relatedId }
      : ({ [OPEN_OVERTIME_REQUESTS_MODAL]: "true" } as any),
  }),

  OVERTIME_REQUEST_APPROVED: (n) => ({
    path: "/overtime",
    query: n.relatedId
      ? { openOvertime: n.relatedId }
      : ({ [OPEN_OVERTIME_REQUESTS_MODAL]: "true" } as any),
  }),

  OVERTIME_REQUEST_REJECTED: (n) => ({
    path: "/overtime",
    query: n.relatedId
      ? { openOvertime: n.relatedId }
      : ({ [OPEN_OVERTIME_REQUESTS_MODAL]: "true" } as any),
  }),

  LEAVE_REQUEST_RECEIVED: () => ({
    path: "/leaves",
  }),
  LEAVE_REQUEST_APPROVED: () => ({ path: "/leaves" }),
  LEAVE_REQUEST_REJECTED: () => ({ path: "/leaves" }),
  APPROVAL: () => ({ path: "/leaves" }),
  REJECTION: () => ({ path: "/leaves" }),
};
