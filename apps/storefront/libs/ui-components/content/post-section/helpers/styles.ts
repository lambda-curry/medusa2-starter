import omit from 'lodash/omit';
import kebabCase from 'lodash/kebabCase';
import { PostSection, type BaseStyles } from '@marketplace/util/medusa/types';
import { imageProxyURL } from '@utils/img-proxy';
import Color from 'color';

const formatColorValue = (color: string) => {
  return color.startsWith('#') ? Color(color).rgb().array().join(' ') : color;
};

/**
 * Prefix all rules in a CSS string with a given parent selector.
 * This function also removes all `@` rules and replaces all instances of `&` with the parent selector.
 * This is useful for setting the scope of a simple, non-nested CSS string to a particular parent.
 *
 * @param parentSelector The selector to prefix each rule with.
 * @param css The CSS string to modify.
 * @returns The modified CSS string.
 */
function prefixCSS(parentSelector: string, css: string): string {
  // Remove white space from each line of the css and remove new lines
  css = css.replace(/\s+/g, ' ').replace(/\n/g, '');

  // Remove all @ rules and their contents
  css = css.replace(/@[^{]+{(?:[^{}]*{[^{}]*}[^{}]*|[^{}]*)*}/g, '');

  // Prefix each CSS rule with the parent selector and replace & with parent selector
  css = css.replace(
    /(^|}|,)\s*([^{,]+)\s*{/g,
    (_match: string, before: string, selectors: string): string => {
      const prefixedSelectors = selectors
        .split(',')
        .map(selector => {
          if (selector.includes('&')) {
            return selector.replace(/&/g, parentSelector).trim();
          } else {
            return `${parentSelector} ${selector.trim()}`;
          }
        })
        .join(', ');

      return `${before} ${prefixedSelectors} {`;
    }
  );

  return css;
}

const generateCSSVariables = (styles: BaseStyles, prefix: string) =>
  Object.entries(styles).reduce((acc, [key, value]) => {
    // Return early if the value is null or undefined.
    if (!value) return acc;

    const property = kebabCase(key);
    const variableName = `--${prefix}-${property}`;
    const backgroundType = styles.background_type;

    switch (property) {
      case 'color':
        if (value) {
          acc = `${acc}${variableName}:${formatColorValue(value)};`;
        }
        break;

      case 'background-image':
        // Only add the CSS variables for image properties if the background type is set to "image".
        // This is to prevent the background image from being overridden when the type "image" is not selected but values are already set.
        if (backgroundType === 'image' && value.url) {
          const proxyUrl = imageProxyURL(value.url, { context: 'post_header' });
          acc = `${acc}${variableName}:url(${proxyUrl});`;
        }
        break;

      case 'background-color':
        if (value) {
          acc = `${acc}${variableName}:${formatColorValue(value)};`;
        }
        break;

      case 'background-position':
      case 'background-size':
      case 'background-repeat':
        // Only add the CSS variables for image properties if the background type is set to "image".
        // This is to prevent the background image from being overridden when the type "image" is not selected but values are already set.
        if (backgroundType === 'image' && value) {
          acc = `${acc}${variableName}:${value};`;
        }
        break;

      case 'background-video':
        break;

      case 'background-overlay':
        if (value.color) {
          acc = `${acc}${variableName}-color:${formatColorValue(value.color)};`;
        }
        if (value.opacity)
          acc = `${acc}${variableName}-opacity:${value.opacity};`;
        if (value.blur) acc = `${acc}${variableName}-blur:${value.blur}px;`;
        if (value.blend_mode)
          acc = `${acc}${variableName}-blend-mode:${value.blend_mode};`;
        break;

      case 'padding':
      case 'margin':
        if (value.top) acc = `${acc}${variableName}-top:${value.top}rem;`;
        if (value.right) acc = `${acc}${variableName}-right:${value.right}rem;`;
        if (value.bottom)
          acc = `${acc}${variableName}-bottom:${value.bottom}rem;`;
        if (value.left) acc = `${acc}${variableName}-left:${value.left}rem;`;
        break;

      default:
        if (value) acc = `${acc}${variableName}:${value};`;
        break;
    }

    return acc;
  }, '');

export const generateSectionStyles = (
  section: PostSection
): { styles: string } => {
  const selector = `[data-post-section-id=${section.id}]`;
  const defaultStyles = generateCSSVariables(
    omit(section.styles?.default || {}, 'custom_css'),
    'default'
  );
  const mobileStyles = generateCSSVariables(
    omit(section.styles?.mobile || {}, 'custom_css'),
    'mobile'
  );
  const defaultCustomCSS = section.styles?.default?.custom_css;
  const mobileCustomCSS = section.styles?.mobile?.custom_css;

  const styles = `
    ${selector} {
      ${defaultStyles}
    }

    ${defaultCustomCSS ? prefixCSS(selector, defaultCustomCSS) : ''}

    @media (max-width: 639px) {
      ${selector} {
        ${mobileStyles}
      }

      ${mobileCustomCSS ? prefixCSS(selector, mobileCustomCSS) : ''}
    }
  `.trim();

  return { styles };
};
