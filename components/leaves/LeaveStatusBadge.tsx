"use client";

import { LEAVE_STATUS_META, type LeaveStatus } from "@/types/leaves.types";

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const meta = LEAVE_STATUS_META[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
