import { Font } from "@libs/utils-to-merge/medusa"
import { Card } from "../card"
import clsx from "clsx"

interface FontPreviewProps {
  className?: string
  label: string
  displayFont: Font
  bodyFont: Font
}

export const FontPreview = ({
  className,
  label,
  displayFont,
  bodyFont,
}: FontPreviewProps) => {
  return (
    <Card
      className={clsx(
        "flex flex-col items-start justify-center overflow-hidden border-4 border-transparent p-8 pb-1 pr-3 text-left !shadow",
        className,
      )}
    >
      <span
        className="text-2xl font-bold"
        style={{ fontFamily: displayFont.family }}
      >
        {displayFont.family}
      </span>
      <span style={{ fontFamily: bodyFont.family }}>{bodyFont.family}</span>

      <span className="mt-2 w-full text-right text-xl font-light text-gray-500">
        {label}
      </span>
    </Card>
  )
}
