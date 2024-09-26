import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';
import { PostSectionType, type PostSection } from '@libs/util/medusa/types';
import { PostSectionStyles } from './PostSectionStyles';
import { PostSectionBackgroundVideo } from './PostSectionBackgroundVideo';
import { PostSectionBackgroundOverlay } from './PostSectionBackgroundOverlay';

export interface PostSectionBaseProps<T extends PostSection = PostSection> extends HTMLAttributes<HTMLElement> {
  section: T;
  isPreview?: boolean;
}

export const PostSectionBase: FC<PostSectionBaseProps> = ({ section, className, children, ...props }) => {
  const { type, id, settings } = section;

  return (
    <>
      <PostSectionStyles section={section} />
      <section
        id={settings?.element_id}
        data-post-section-id={section.id}
        className={clsx(
          `mkt-post-section mkt-post-section--${type} mkt-post-section--${id} relative`,
          {
            '[--default-padding-bottom:4rem] [--default-padding-top:4rem] [--mobile-padding-bottom:3rem]  [--mobile-padding-top:3rem]':
              section.type !== PostSectionType.HERO && section.type !== PostSectionType.RAW_HTML
          },
          className,
          settings?.element_class_name
        )}
        {...props}
      >
        <PostSectionBackgroundVideo className="z-0" section={section} />
        <PostSectionBackgroundOverlay className="z-[1]" />
        <div className="mkt-post-section__inner relative z-[2]">{children}</div>
      </section>
    </>
  );
};
