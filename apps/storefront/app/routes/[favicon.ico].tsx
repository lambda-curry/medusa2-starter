import { siteSettings } from '@libs/config/site/site-settings';
import { redirect } from '@remix-run/node';

export const loader = async () => {
  return redirect(siteSettings.favicon, { status: 302 });
};
