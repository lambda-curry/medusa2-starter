import { hexToRgb } from './colors';
import type { SiteSettings, StyleColor } from './medusa/types';
import defaultTheme from 'tailwindcss/defaultTheme';

export const generateCSSVariablesInnerHTML = ({
  primary_theme_colors,
  accent_theme_colors,
  highlight_theme_colors,
  display_font,
  body_font
}: SiteSettings) => {
  let cssVarsString = '';
  if (primary_theme_colors && accent_theme_colors && highlight_theme_colors) {
    cssVarsString = ['primary', 'accent', 'highlight'].reduce((cssVarsStringAcc, colorTypeCurr) => {
      const colorObjects: Record<string, StyleColor> = {
        primary: primary_theme_colors,
        accent: accent_theme_colors,
        highlight: highlight_theme_colors
      };

      const colorVariables = Object.entries(colorObjects[colorTypeCurr]).reduce((acc, [colorKey, colorValue]) => {
        return (acc += `--color-${colorTypeCurr}-${colorKey}: ${hexToRgb(colorValue)};`);
      }, '');
      return (cssVarsStringAcc += colorVariables);
    }, '');
  }

  const displayFonts = ['pragmatica', ...defaultTheme.fontFamily.serif];
  if (display_font) displayFonts.unshift(display_font.family);
  cssVarsString += `--font-display: ${displayFonts.join(', ')};`;

  const bodyFonts = ['pragmatica', ...defaultTheme.fontFamily.sans];
  if (body_font) bodyFonts.unshift(body_font.family);
  cssVarsString += `--font-body: ${bodyFonts.join(', ')};`;

  return `:root {${cssVarsString}}`;
};
