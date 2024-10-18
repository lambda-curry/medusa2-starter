import { NavigationCollection, NavigationItemLocation } from '@libs/types';

export const headerNavigationItems: NavigationCollection = [
  {
    id: 1,
    label: 'View all Blends',
    url: '/products',
    sort_order: 0,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 2,
    label: 'Shop our Collections',
    url: '/collections/light-roasts',
    sort_order: 1,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 3,
    label: 'Our Story',
    url: '/about-us',
    sort_order: 1,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
];

export const footerNavigationItems: NavigationCollection = [
  {
    id: 1,
    label: 'Our Beans',
    url: '/products',
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
  {
    id: 2,
    label: 'Light Roasts',
    url: '/collections/light-roasts',
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
  {
    id: 3,
    label: 'Medium Roasts',
    url: '/collections/medium-roasts',
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
  {
    id: 4,
    label: 'Dark Roasts',
    url: '/collections/dark-roasts',
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
];
