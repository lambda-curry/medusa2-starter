import { SiteSettings } from '@libs/types';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  PinterestIcon,
  SnapchatIcon,
  TiktokIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@app/components/common/assets/icons';
import { IconButton } from '@app/components/common/buttons/IconButton';
import type { FC } from 'react';

export const SocialIcons: FC<{ siteSettings?: SiteSettings }> = ({ siteSettings }) => {
  const socialLinks = [
    { icon: FacebookIcon, url: siteSettings?.social_facebook },
    { icon: InstagramIcon, url: siteSettings?.social_instagram },
    { icon: TwitterIcon, url: siteSettings?.social_twitter },
    { icon: YoutubeIcon, url: siteSettings?.social_youtube },
    { icon: LinkedinIcon, url: siteSettings?.social_linkedin },
    { icon: PinterestIcon, url: siteSettings?.social_pinterest },
    { icon: TiktokIcon, url: siteSettings?.social_tiktok },
    { icon: SnapchatIcon, url: siteSettings?.social_snapchat },
  ].filter((link) => !!link.url);

  if (socialLinks.length === 0) return null;

  return (
    <div className="xs:grid-cols-8 grid grid-cols-4 gap-2">
      {socialLinks.map(({ icon, url }) => (
        <IconButton
          key={url}
          as={(props) => <a href={url} rel="noopener noreferrer" target="_blank" {...props} />}
          className="text-white hover:text-black"
          iconProps={{ fill: 'currentColor', width: '24' }}
          icon={icon}
        />
      ))}
    </div>
  );
};
