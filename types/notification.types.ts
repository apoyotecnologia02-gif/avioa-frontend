import {
  OPEN_LEAVE_REQUESTS_MODAL,
  OPEN_OVERTIME_REQUESTS_MODAL,
} from "@/utils/constants";
import { TeamOvertimeRecord } from "./overtime.types";


export enum NotificationType {
  OVERTIME_REQUEST = "OVERTIME_REQUEST",
  OVERTIME_APPROVED = "OVERTIME_APPROVED",
  OVERTIME_REJECTED = "OVERTIME_REJECTED",

  POINT_REQUEST = "POINT_REQUEST",
  POINT_REQUEST_APPROVED = "POINT_REQUEST_APPROVED",
  POINT_REQUEST_REJECTED = "POINT_REQUEST_REJECTED",

  EQUIPMENT_LOAN_REQUEST = "EQUIPMENT_LOAN_REQUEST",
  EQUIPMENT_LOAN_APPROVED = "EQUIPMENT_LOAN_APPROVED",
  EQUIPMENT_LOAN_REJECTED = "EQUIPMENT_LOAN_REJECTED",
  EQUIPMENT_LOAN_RETURNED = "EQUIPMENT_LOAN_RETURNED",

  MAINTENANCE_REQUEST = "MAINTENANCE_REQUEST",
  MAINTENANCE_STATUS_CHANGE = "MAINTENANCE_STATUS_CHANGE",
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
  notificationId: string;
  isRead: boolean;
  receivedAt: Date;
  relatedId?: string;
}


export type NotificationTypeNav =
  | "POINT_REQUEST"
  | "POINT_REQUEST_APPROVED"
  | "POINT_REQUEST_REJECTED"
  | "OVERTIME_REQUEST"
  | "OVERTIME_APPROVED"
  | "OVERTIME_REJECTED"
  | "LEAVE_REQUEST_RECEIVED"
  | "LEAVE_REQUEST_APPROVED"
  | "LEAVE_REQUEST_REJECTED"
  | "LEAVE_REQUEST_UPDATED"
  | "COMPENSATED_LEAVE_PENDING_HR"
  | "EQUIPMENT_LOAN_REQUEST"
  | "EQUIPMENT_LOAN_APPROVED"
  | "EQUIPMENT_LOAN_REJECTED"
  | "EQUIPMENT_LOAN_RETURNED"
  | "MAINTENANCE_REQUEST"
  | "MAINTENANCE_STATUS_CHANGE"
  | "APPROVAL"
  | "REJECTION";

type RouteTarget = {
  path: string;
  query?: Record<string, string>;
};

const overtimeRoute = (n: Notification): RouteTarget => ({
  path: "/overtime",
  query: n.relatedId
    ? { openOvertime: n.relatedId }
    : ({ [OPEN_OVERTIME_REQUESTS_MODAL]: "true" } as any),
});

export const NOTIFICATION_ROUTES: Record<
  NotificationTypeNav,
  (n: Notification) => RouteTarget
> = {

  POINT_REQUEST: () => ({ path: "/point-request" }),
  POINT_REQUEST_APPROVED: () => ({ path: "/points/my-requests" }),
  POINT_REQUEST_REJECTED: () => ({ path: "/points/my-requests" }),

  OVERTIME_REQUEST: overtimeRoute,
  OVERTIME_APPROVED: overtimeRoute,
  OVERTIME_REJECTED: overtimeRoute,

  LEAVE_REQUEST_RECEIVED: () => ({ path: "/leaves" }),
  LEAVE_REQUEST_APPROVED: () => ({ path: "/leaves" }),
  LEAVE_REQUEST_REJECTED: () => ({ path: "/leaves" }),
  LEAVE_REQUEST_UPDATED: () => ({ path: "/leaves" }),
  COMPENSATED_LEAVE_PENDING_HR: () => ({ path: "/leaves/hr-validation" }),
  APPROVAL: () => ({ path: "/leaves" }),
  REJECTION: () => ({ path: "/leaves" }),


  EQUIPMENT_LOAN_REQUEST: () => ({ path: "/equipment-loans" }),
  EQUIPMENT_LOAN_APPROVED: () => ({ path: "/equipment-loans" }),
  EQUIPMENT_LOAN_REJECTED: () => ({ path: "/equipment-loans" }),
  EQUIPMENT_LOAN_RETURNED: () => ({ path: "/equipment-loans" }),

 
  MAINTENANCE_REQUEST: () => ({ path: "/equipment-maintenance" }),
  MAINTENANCE_STATUS_CHANGE: () => ({ path: "/equipment-maintenance" }),
};