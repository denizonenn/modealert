import { cn } from "@/lib/utils"

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-zinc-500",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
      {children}
    </p>
  )
}
