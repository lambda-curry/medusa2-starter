import { useRootLoaderData } from './useRootLoaderData';

export const useSiteDetails = () => {
  const data = useRootLoaderData();
  const { store, site_settings, feature_flags, header_navigation_items, footer_navigation_items, admin_url } =
    data?.siteDetails || {};

  return {
    store,
    site_settings,
    admin_url,
    feature_flags,
    header_navigation_items,
    footer_navigation_items
  };
};
