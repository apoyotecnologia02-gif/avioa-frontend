import { DaySummary } from "@/components/overtime/OvertimeCalendar";

export type OvertimeStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface OvertimeRecord {
  id: string;
  date: string; // ISO date string e.g. "2026-05-07"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  totalHours: number;
  description: string;
  status: OvertimeStatus;
  comment?: string; // leader comment after review
  createdAt: string; // ISO date string e.g. "2026-05-07T14:30:00Z"
}

export interface OvertimeDaySummary {
  date: string; // "YYYY-MM-DD"
  totalHours: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  records?: OvertimeRecord[];
  entries?: OvertimeRecord[];
  description?: string;
}

export interface OvertimeSummary {
  year: number;
  month: number;
  totalHours: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  // days: OvertimeDaySummary[];
  days: DaySummary[];
}

export interface OvertimeUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  position?: string;
  department?: string;
}

export interface TeamOvertimeRecord extends OvertimeRecord {
  user: OvertimeUser;
}

export interface CreateOvertimeDto {
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface ReviewOvertimeDto {
  status: "APPROVED" | "REJECTED";
  comment?: string;
}
