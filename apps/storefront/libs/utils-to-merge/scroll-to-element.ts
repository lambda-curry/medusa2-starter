import { isBrowser } from './browser';

// Override the default scroll behavior to add offset for the header.
export const scrollToElement = (id?: string) => {
  if (!isBrowser() || !id) return;

  const targetElement = document.querySelector(id);
  const headerElement = document.querySelector('#mkt-header');

  if (!targetElement) return;

  window.scrollTo({
    // Scroll to the top of the section element, minus the height of the header
    top: targetElement.getBoundingClientRect().top + window.pageYOffset - (headerElement?.clientHeight || 0),
    behavior: 'smooth'
  });
};
