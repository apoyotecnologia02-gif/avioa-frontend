import { TeamOvertimeRecord } from "./overtime.types";

export enum NotificationType {
  OVERTIME_REQUEST = "OVERTIME_REQUEST",
  POINT_REQUEST = "POINT_REQUEST",
  POINT_REQUEST_APPROVED = "POINT_REQUEST_APPROVED",
  POINT_REQUEST_REJECTED = "POINT_REQUEST_REJECTED",
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
}
