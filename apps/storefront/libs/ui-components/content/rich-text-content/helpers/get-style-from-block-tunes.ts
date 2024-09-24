import { CSSProperties } from 'react';
import { ContentBlockTunes } from '@marketplace/util/medusa/types';

export const getStyleFromBlockTunes = (tunes: ContentBlockTunes) => {
  const style: Partial<
    CSSProperties & {
      textAlign: 'inherit' | 'left' | 'right' | 'center' | 'justify';
    }
  > = {};

  // NOTE: If text align is left, we don't want to set the style, as it's the default.
  // This allows the style to be determined by the parent element (i.e., section styles).
  if (tunes?.textAlign) style.textAlign = tunes.textAlign.alignment === 'left' ? 'inherit' : tunes.textAlign.alignment;

  return style;
};
