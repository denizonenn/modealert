import { EventStatus } from "@/types/status";

export function isValidStatus(
  status: string
): status is EventStatus {
  return [
    "live",
    "upcoming",
    "ended",
    "checking",
    "delayed",
    "unknown",
  ].includes(status);
}

export function validateEventName(name: string) {
  return name.trim().length > 0;
}