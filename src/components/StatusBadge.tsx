"use client";

import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[status] || "bg-gray-100"}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
