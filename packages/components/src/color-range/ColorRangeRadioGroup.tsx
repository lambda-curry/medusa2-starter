import { useState, useRef } from 'react';
import { Field, Label, Radio, RadioGroup } from '@headlessui/react';
import { ColorRange } from './ColorRange';
import clsx from 'clsx';
import { ScrollArrowButtons } from '../buttons/ScrollArrowButtons';
import type { StyleColor } from '@utils/medusa';
import { useScrollArrows } from '@utils/hooks/useScrollArrows';

export interface ColorSet {
  label: string;
  colors: StyleColor;
}

interface ColorRangeRadioGroupProps {
  initialValue?: ColorSet;
  colorSets: ColorSet[];
  className?: string;
  onChange?: (colorSet: ColorSet) => void;
}

export const ColorRangeRadioGroup = ({
  colorSets,
  className,
  onChange,
  initialValue,
}: ColorRangeRadioGroupProps) => {
  const [selectedColorSet, setSelectedColorSet] = useState<ColorSet | null>(
    initialValue || null
  );
  const { scrollableDivRef, ...scrollArrowProps } = useScrollArrows({
    buffer: 100,
    resetOnDepChange: [],
  });

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
        {selectedColorSet &&
          Object.keys(selectedColorSet.colors).map(key => (
            <div key={key}>
              <input
                type="hidden"
                name={`brand_data[primary_theme_colors][_${key}]`}
                value={selectedColorSet?.colors[key as keyof StyleColor]}
              />
              <input
                type="hidden"
                name={`brand_data[accent_theme_colors][_${key}]`}
                value={selectedColorSet?.colors[key as keyof StyleColor]}
              />
            </div>
          ))}
        <RadioGroup
          className={clsx(className, 'whitespace-nowrap')}
          value={selectedColorSet}
          onChange={colorSet => {
            setSelectedColorSet(colorSet);
            if (colorSet) onChange?.(colorSet);
          }}
          aria-label="Color Set"
        >
          {colorSets.map((colorSet, index) => (
            <Field
              key={`${colorSet.label}_${index}`}
              className="mr-4 inline-flex items-center gap-2 last:mr-0"
            >
              <Label
                className={clsx('flex flex-col gap-2', {
                  '[&_.color-range]:border-primary-400':
                    selectedColorSet === colorSet,
                })}
              >
                <Radio value={colorSet} className="hidden" />
                <span
                  className="-mb-2 pl-1 text-sm font-bold"
                  style={{
                    color: colorSet.colors['800'],
                  }}
                >
                  {colorSet.label}
                </span>
                <ColorRange colors={colorSet.colors} />
              </Label>
            </Field>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};
