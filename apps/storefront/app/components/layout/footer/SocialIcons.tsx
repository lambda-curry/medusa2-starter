import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  PinterestIcon,
  SnapchatIcon,
  TiktokIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@components/assets/icons';
import { IconButton } from '@components/buttons/IconButton';
import { SiteSettings } from '@marketplace/util/medusa';
import type { FC } from 'react';

export const SocialIcons: FC<{ siteSettings?: SiteSettings }> = ({
  siteSettings,
}) => {
  const socialLinks = [
    { icon: InstagramIcon, url: siteSettings?.social_instagram },
    { icon: YoutubeIcon, url: siteSettings?.social_youtube },
    { icon: FacebookIcon, url: siteSettings?.social_facebook },
    { icon: TwitterIcon, url: siteSettings?.social_twitter },
    { icon: LinkedinIcon, url: siteSettings?.social_linkedin },
    { icon: PinterestIcon, url: siteSettings?.social_pinterest },
    { icon: TiktokIcon, url: siteSettings?.social_tiktok },
    { icon: SnapchatIcon, url: siteSettings?.social_snapchat },
  ].filter(link => !!link.url);

  if (socialLinks.length === 0) return null;

  return (
    <div className="xs:grid-cols-8 grid grid-cols-4 gap-2">
      {socialLinks.map(({ icon, url }) => (
        <IconButton
          key={url}
          as={props => (
            <a
              href={url}
              rel="noopener noreferrer"
              target="_blank"
              {...props}
            />
          )}
          className="!text-primary-900"
          iconProps={{ fill: 'currentColor', width: '24' }}
          icon={icon}
        />
      ))}
    </div>
  );
};
