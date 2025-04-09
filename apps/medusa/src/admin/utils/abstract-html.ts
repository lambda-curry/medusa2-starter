/**
 * Abstracts HTML content by removing class attributes, SVG elements, and data URL images
 * @param selector - CSS selector to find the target element
 * @returns The HTML content with classes, SVGs, and data URL images removed, or null if element not found or not in browser
 */
export const abstractHtmlContent = (selector: string = 'main'): string | null => {
  if (typeof document === 'undefined') return null;

  const element = document.querySelector(selector);
  if (!element) return null;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.removeAttribute('class');

  // Process all elements in a single pass
  clone.querySelectorAll('*').forEach((elem) => {
    // Remove class attributes
    elem.removeAttribute('class');

    // Remove SVG elements
    if (elem instanceof SVGElement) elem.remove();

    // Remove images with data URLs
    if (elem instanceof HTMLImageElement && elem.src.startsWith('data:')) elem.remove();
  });

  return clone.outerHTML;
};
