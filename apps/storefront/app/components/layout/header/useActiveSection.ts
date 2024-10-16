import type { NavigationItem } from '@libs/types';
import { useEffect, useState } from 'react';

export const useActiveSection = (navItems: NavigationItem[]) => {
  if (typeof window === 'undefined') return { activeSection: null };

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const localNavigationItems = navItems.filter((item) => item.url.includes('#'));
  const hasLocalNavigation = localNavigationItems.some((item) => {
    const id = item.url.split('#')[1].split('?')[0];
    return document.getElementById(id);
  });

  useEffect(() => {
    if (!hasLocalNavigation) return;

    const sections = localNavigationItems
      .map((item) => {
        const id = item.url.split('#')[1].split('?')[0];
        const element = document.getElementById(id);
        if (!element) return;
        return {
          id,
          element,
        };
      })
      .filter((section) => section);

    const observer = new IntersectionObserver(
      (entries) => {
        // Note: this is my best attempt at only setting the active section when the section is near the top of the viewport
        // If we wanted to be more precise we could combine this with a scroll listener, but I think this is good enough
        const activeSection = entries.find(
          (entry) => entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight / 2,
        );

        if (activeSection) {
          setActiveSection(activeSection.target.id);
        } else {
          setActiveSection(null);
        }
      },
      { threshold: [0, 1] },
    );

    sections.forEach((section) => {
      if (!section) return;
      observer.observe(section.element);
    });

    return () => {
      observer.disconnect();
    };
  }, [hasLocalNavigation, localNavigationItems]);

  return { activeSection };
};
