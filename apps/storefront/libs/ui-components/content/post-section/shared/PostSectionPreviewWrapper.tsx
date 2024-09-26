import { FC, PropsWithChildren, useEffect, useState } from 'react';
import clsx from 'clsx';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import { PostSectionStatus, type PostSection } from '@libs/util/medusa/types';
import { getSectionTypeLabel } from '../helpers/get-section-type-label';
import { isWithinIframe } from '@libs/util/iframe/isWithinIframe';

export const PostSectionPreviewWrapper: FC<PropsWithChildren<{ section: PostSection }>> = ({ section, children }) => {
  const [showOutlines, setShowOutlines] = useState(false);
  const isDraft = section.status === PostSectionStatus.DRAFT;
  const isPublished = section.status === PostSectionStatus.PUBLISHED;

  useEffect(() => {
    // NOTE: We need to use an effect because sections are initially rendered on the server,
    // so we won't know if it's within an iframe until the client-side hydration.
    setShowOutlines(isWithinIframe());
  }, []);

  return (
    <div
      // The ID is for applying the `:target` styles for the active preview section.
      id={`${section.id}__preview`}
      // The data attribute is for targeting when the user clicks on the preview section.
      data-post-section-preview-id={section.id}
      className={clsx('group/post-section-preview relative min-h-[1.5rem]', {
        'cursor-pointer': showOutlines
      })}
    >
      <div
        className={clsx('pointer-events-none absolute left-0 top-0 z-30 h-full w-full outline-2 -outline-offset-2', {
          'group-target/post-section-preview:outline-dashed group-hover/post-section-preview:outline-dashed':
            showOutlines,
          'group-target/post-section-preview:outline-yellow-500 group-hover/post-section-preview:outline-yellow-500':
            isDraft,
          'group-target/post-section-preview:outline-violet-700 group-hover/post-section-preview:outline-violet-700':
            isPublished
        })}
      />

      <div
        className={clsx('pointer-events-none absolute z-30 hidden max-w-full', {
          'group-target/post-section-preview:flex group-hover/post-section-preview:flex': showOutlines
        })}
      >
        <div className="flex h-6 w-6 shrink-0 grow-0 items-center justify-center bg-violet-500">
          <PencilIcon className="h-4 w-4 text-white" />
        </div>

        <div className={clsx('h-6 min-w-0 flex-1 truncate bg-violet-700 px-2 text-xs leading-6 text-white')}>
          {section.name || (
            <>
              Untitled - <span className="capitalize">{getSectionTypeLabel(section.type)}</span>
            </>
          )}
        </div>

        {isDraft && (
          <div className={clsx('h-6 shrink-0 grow-0 bg-yellow-500 px-2 text-xs leading-6 text-white')}>Draft</div>
        )}
      </div>

      {children}
    </div>
  );
};

export default PostSectionPreviewWrapper;
