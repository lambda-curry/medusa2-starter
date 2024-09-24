import { MarketplacesCollection } from './marketplaces';
import { NavigationCollection } from './navigation';
import { SessionsCollection } from './sessions';

export type Collections = {
  Navigation: NavigationCollection;
  Sessions: SessionsCollection;
  Marketplaces: MarketplacesCollection;
};
