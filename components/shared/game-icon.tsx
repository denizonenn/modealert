import { GAME_BRAND_ICONS } from "./game-brand-icons"

interface GameIconProps {
  gameId: string
  logo: string
  color: string
  size?: "sm" | "md" | "lg"
}

const CONTAINER_SIZES: Record<
  NonNullable<GameIconProps["size"]>,
  string
> = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-11 w-11 rounded-xl",
  lg: "h-14 w-14 rounded-xl",
}

const ICON_SIZES: Record<
  NonNullable<GameIconProps["size"]>,
  number
> = {
  sm: 16,
  md: 22,
  lg: 28,
}

export function GameIcon({
  gameId,
  logo,
  color,
  size = "md",
}: GameIconProps) {
  const BrandIcon = GAME_BRAND_ICONS[gameId]

  return (
    <div
      className={`flex shrink-0 items-center justify-center border ${CONTAINER_SIZES[size]}`}
      style={{
        backgroundColor: `${color}1a`,
        borderColor: `${color}40`,
      }}
    >
      {BrandIcon ? (
        <BrandIcon
          size={ICON_SIZES[size]}
          style={{ color }}
        />
      ) : (
        <span>{logo}</span>
      )}
    </div>
  )
}
