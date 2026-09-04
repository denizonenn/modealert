import { ArrowUpRight } from "lucide-react"

import type { ExternalResource } from "@/lib/constants/external-resources"

export function ExternalResourceLinks({
  resources,
  className,
}: {
  resources: ExternalResource[]
  className?: string
}) {
  return (
    <div className={className ?? "mt-4 flex flex-wrap gap-3"}>
      {resources.map((resource) => (
        <a
          key={resource.url}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 hover:border-white/20 hover:text-white"
        >
          {resource.label}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  )
}
