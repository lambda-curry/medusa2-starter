import { StyleColor } from "@libs/utils-to-merge/medusa"

interface ColorRangeProps {
  colors: StyleColor
}

export const ColorRange = ({ colors }: ColorRangeProps) => {
  return (
    <div className="color-range inline-flex cursor-pointer overflow-hidden rounded-lg border-4 border-transparent">
      {["900", "700", "500", "300"].map((key) => (
        <div
          key={key}
          className="h-20 w-10"
          style={{ backgroundColor: colors[key as keyof StyleColor] }}
        />
      ))}
    </div>
  )
}
