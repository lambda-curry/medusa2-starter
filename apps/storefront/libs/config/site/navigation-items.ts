import { NavigationCollection, NavigationItemLocation } from '@libs/types';

export const headerNavigationItems: NavigationCollection = [
  {
    id: 1,
    label: 'Buy Beans',
    url: '/products',
    sort_order: 0,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 2,
    label: 'Our Story',
    url: '/story',
    sort_order: 1,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 3,
    label: 'Location',
    url: '/location',
    sort_order: 1,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 4,
    label: 'How To Brew',
    url: '/how-to-brew',
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
