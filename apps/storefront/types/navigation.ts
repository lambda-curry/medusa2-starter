export interface NavigationItem {
  id: number;
  sort: number;
  label: string;
  url: string;
  new_tab?: boolean;
}

export type NavigationCollection = NavigationItem[];
