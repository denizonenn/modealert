interface GameIconProps {
  logo: string
  color: string
  size?: "sm" | "md" | "lg"
}

const SIZES: Record<
  NonNullable<GameIconProps["size"]>,
  string
> = {
  sm: "h-8 w-8 text-base rounded-lg",
  md: "h-11 w-11 text-xl rounded-xl",
  lg: "h-14 w-14 text-2xl rounded-xl",
}

export function GameIcon({
  logo,
  color,
  size = "md",
}: GameIconProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center border ${SIZES[size]}`}
      style={{
        backgroundColor: `${color}1a`,
        borderColor: `${color}40`,
      }}
    >
      <span>{logo}</span>
    </div>
  )
}
