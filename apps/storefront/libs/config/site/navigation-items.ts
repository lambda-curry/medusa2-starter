import { NavigationCollection, NavigationItemLocation } from '@libs/types';

export const headerNavigationItems: NavigationCollection = [
  {
    id: 6,
    label: 'Technical Skills',
    url: '/categories/technical-skills',
    sort_order: 0,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 5,
    label: 'Business Courses',
    url: '/categories/business',
    sort_order: 1,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 7,
    label: 'Leadership Training',
    url: '/categories/leadership',
    sort_order: 2,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 2,
    label: 'All Programs',
    url: '/products',
    sort_order: 3,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
];

export const footerNavigationItems: NavigationCollection = [
  {
    id: 1,
    label: 'All Programs',
    url: '/products',
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
  {
    id: 2,
    label: 'Business Courses',
    url: '/categories/business',
    location: NavigationItemLocation.footer,
    sort_order: 2,
    new_tab: false,
  },
  {
    id: 3,
    label: 'Technical Skills',
    url: '/categories/technical-skills',
    location: NavigationItemLocation.footer,
    sort_order: 3,
    new_tab: false,
  },
  {
    id: 4,
    label: 'Leadership Training',
    url: '/categories/leadership',
    location: NavigationItemLocation.footer,
    sort_order: 4,
    new_tab: false,
  },
];
