export interface MartketplacesItem {
  id: string;
  status: string;
  sort: number;
  name: string;
  logo: string;
  main_navigation: number[];
  new_tab?: boolean;
}

export type MarketplacesCollection = MartketplacesItem[];
