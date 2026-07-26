import { STATUS } from "@/constants/status";
import { EventStatus } from "@/types/status";

interface Props {
  status: EventStatus;
}

export default function StatusBadge({
  status,
}: Props) {
  const config = STATUS[status];

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}