import { PostSection } from '@lambdacurry/page-builder-types';
import { DotsSix, EllipsisHorizontal, Pencil, Trash } from '@medusajs/icons';
import { Badge, Button, DropdownMenu, IconButton, Text, Tooltip, toast } from '@medusajs/ui';
import clsx from 'clsx';
import { FC, MouseEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUpdatePostSection } from '../../../../hooks/post-sections-mutations';
import { usePost } from '../../../hooks/use-post';
import { PostSectionDeleteButton } from './PostSectionDeleteButton';

export interface PostSectionListItemProps {
  index: number;
  section: PostSection;
}

export const PostSectionListItem: FC<PostSectionListItemProps> = ({ index, section }) => {
  const { post } = usePost();
  //   const { onDuplicate, refetchPostSections, removeItem, onDelete } = usePostSectionsEditorContext();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { mutateAsync: updatePostSection } = useAdminUpdatePostSection();
  //   const { mutateAsync: duplicatePostSection } = useAdminDuplicatePostSection(section.id);

  const handleEditClick = () => {
    // navigate(selectEditSectionPath(post, section.id));
    toast.warning('Not implemented');
    setIsMenuOpen(false);
  };

  const handleDuplicateClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    // TODO: Implement duplicate section
    // event.stopPropagation();
    // const {
    //   data: { post_section },
    // } = await duplicatePostSection({ type: section.type });
    // setIsMenuOpen(false);
    // onDuplicate(section.id, post_section);
  };

  const handlePublishClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    toast.warning('Not implemented');

    // event.stopPropagation();
    // // updateLivePreviewPostData({
    // //   post,
    // //   sections: [{ ...section, status: PostSectionStatus.PUBLISHED }],
    // // });
    // await updatePostSection({
    //   id: section.id,
    //   data: {
    //     status: 'published',
    //   },
    // });
    // setIsMenuOpen(false);
    // refetchPostSections();
  };

  const handleUnpublishClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    toast.warning('Not implemented');
    // event.stopPropagation();
    // updateLivePreviewPostData({
    //   post,
    //   sections: [{ ...section, status: PostSectionStatus.DRAFT }],
    // });
    // await updatePostSection({
    //   type: section.type,
    //   status: PostSectionStatus.DRAFT,
    // });
    // setIsMenuOpen(false);
    // refetchPostSections();
  };

  const handleRemoveClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.stopPropagation();
    toast.warning('Not implemented');
    // removeItem(index);
    // updateLivePreviewPostData({
    //   post,
    //   sectionIndex: index,
    // });
    // setIsMenuOpen(false);
  };

  const toggleIsMenuOpen: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <article
      className={clsx(
        `border-grey-20 rounded-rounded hover:bg-grey-5 focus:border-violet-60 focus:text-violet-60 focus:shadow-cta flex items-center justify-between border bg-white p-3 text-left leading-none focus:outline-none`,
        {
          '!bg-grey-5 !pointer-events-none !cursor-not-allowed': false,
        },
      )}
      onClick={handleEditClick}
      tabIndex={0}
      role="button"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <div className="shrink-0 grow-0">
          {/* <SortableItemHandle> */}
          <IconButton size="small" variant="transparent" type="button" className={clsx('cursor-grab')}>
            <DotsSix />
          </IconButton>
          {/* </SortableItemHandle> */}
        </div>

        <div className="min-w-0 max-w-[calc(100%-40px)] flex-1">
          <Text size="base" weight="plus" className="w-full truncate">
            {section.name || 'Untitled'}
          </Text>
        </div>
      </div>

      {section.status === 'draft' && <Badge className="mx-2">Draft</Badge>}

      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton variant="transparent" size="small" onClick={toggleIsMenuOpen}>
            <EllipsisHorizontal />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="bg-grey-0 border-grey-20 rounded-rounded shadow-dropdown z-30 min-w-[160px] border py-2"
        >
          <DropdownMenu.Item asChild>
            <Button
              variant="transparent"
              size="small"
              className="w-full justify-start rounded-none px-4"
              onClick={handleEditClick}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </DropdownMenu.Item>

          {section.status === 'published' && (
            <DropdownMenu.Item asChild>
              <Button
                variant="transparent"
                size="small"
                className="w-full justify-start rounded-none px-4"
                onClick={handleUnpublishClick}
              >
                Unpublish
              </Button>
            </DropdownMenu.Item>
          )}

          {section.status === 'draft' && (
            <DropdownMenu.Item asChild>
              <Button
                variant="transparent"
                size="small"
                className="w-full justify-start rounded-none px-4"
                onClick={handlePublishClick}
              >
                Publish
              </Button>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item asChild>
            <Button
              variant="transparent"
              size="small"
              className="w-full justify-start rounded-none px-4"
              onClick={handleDuplicateClick}
            >
              Duplicate
            </Button>
          </DropdownMenu.Item>

          <DropdownMenu.Item>
            <PostSectionDeleteButton
              postSection={section}
              size="small"
              className="!w-full justify-start rounded-none !border-none px-4"
              onCancel={() => setIsMenuOpen(false)}
            >
              <Trash className="h-4 w-4" /> Delete
            </PostSectionDeleteButton>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </article>
  );
};
