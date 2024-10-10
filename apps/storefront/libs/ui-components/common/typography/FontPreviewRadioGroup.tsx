import { useState } from "react"
import { Field, Label, Radio, RadioGroup } from "@headlessui/react"
import { FontPreview } from "./FontPreview"
import clsx from "clsx"
import type { Font } from "@libs/utils-to-merge/medusa"
import { ScrollArrowButtons } from "../buttons/ScrollArrowButtons"
import { useScrollArrows } from "@libs/utils-to-merge/hooks/useScrollArrows"

interface FontSet {
  label: string
  displayFont: Font
  bodyFont: Font
}

interface FontPreviewRadioGroupProps {
  initialValue?: FontSet
  fontSets: FontSet[]
  className?: string
  onChange?: (fontSet: FontSet) => void
}

export const FontPreviewRadioGroup = ({
  fontSets,
  className,
  onChange,
  initialValue,
}: FontPreviewRadioGroupProps) => {
  const [selectedFontSet, setSelectedFontSet] = useState<FontSet | null>(
    initialValue || null,
  )
  const { scrollableDivRef, ...scrollArrowProps } = useScrollArrows({
    buffer: 100,
    resetOnDepChange: [],
  })

  return (
    <div className="relative pb-10">
      <ScrollArrowButtons
        className="!bottom-[-2px] !left-[5%] !top-[unset] !w-[90%] [&_button]:h-12 [&_button]:w-20 [&_svg]:!h-8 [&_svg]:!w-8"
        {...scrollArrowProps}
      />

      <div
        ref={scrollableDivRef}
        className="relative mb-2 w-full overflow-x-scroll"
      >
        {selectedFontSet && (
          <>
            <input
              type="hidden"
              name="font_data.display_font.family"
              value={selectedFontSet.displayFont.family}
            />
            <input
              type="hidden"
              name="font_data.body_font.family"
              value={selectedFontSet.bodyFont.family}
            />
          </>
        )}
        <RadioGroup
          className={clsx(className, "whitespace-nowrap")}
          value={selectedFontSet}
          onChange={(fontSet) => {
            setSelectedFontSet(fontSet)
            if (fontSet) onChange?.(fontSet)
          }}
          aria-label="Font Set"
        >
          {fontSets.map((fontSet, index) => (
            <Field
              key={`${fontSet.label}_${index}`}
              className="mr-4 inline-flex w-full min-w-[240px] last:mr-0 sm:w-auto"
            >
              <Label className="w-full cursor-pointer">
                <Radio value={fontSet} className="hidden" />
                <FontPreview
                  className={clsx("w-full", {
                    "!border-primary-400": selectedFontSet === fontSet,
                  })}
                  label={fontSet.label}
                  displayFont={fontSet.displayFont}
                  bodyFont={fontSet.bodyFont}
                />
              </Label>
            </Field>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
