interface Props {
  isLimitedTime: boolean
  className?: string
}

export function RotationBadge({ isLimitedTime, className }: Props) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        isLimitedTime
          ? "border-amber-400/20 bg-amber-500/10 text-amber-400"
          : "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
      } ${className ?? ""}`}
    >
      {isLimitedTime ? "Limited Time" : "Permanent"}
    </span>
  )
}
