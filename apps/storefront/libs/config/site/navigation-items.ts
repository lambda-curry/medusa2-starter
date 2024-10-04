import {
  NavigationCollection,
  NavigationItemLocation,
} from "@libs/util/medusa/types"

export const headerNavigationItems: NavigationCollection = [
  {
    id: 1,
    label: "Buy Our Blends",
    url: "/products",
    sort_order: 0,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 2,
    label: "Out Story",
    url: "/story",
    sort_order: 1,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 3,
    label: "Location",
    url: "/location",
    sort_order: 1,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
  {
    id: 4,
    label: "How To Brew",
    url: "/how-to-brew",
    sort_order: 1,
    location: NavigationItemLocation.header,
    new_tab: false,
  },
]

export const footerNavigationItems: NavigationCollection = [
  {
    id: 2,
    label: "Blends",
    url: "/products",
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
  {
    id: 3,
    label: "Mugs",
    url: "/categories/mugs",
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
  {
    id: 4,
    label: "Totes",
    url: "/categories/totes",
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
  {
    id: 5,
    label: "Shirts",
    url: "/categories/shirts",
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
  {
    id: 6,
    label: "Terms and Conditions",
    url: "/terms-and-conditions",
    location: NavigationItemLocation.footer,
    sort_order: 1,
    new_tab: false,
  },
]
