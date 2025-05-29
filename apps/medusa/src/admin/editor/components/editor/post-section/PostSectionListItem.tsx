import { PostSection } from '@lambdacurry/page-builder-types';
import { DotsSix, EllipsisHorizontal, Trash } from '@medusajs/icons';
import { Badge, DropdownMenu, IconButton, Text, toast, usePrompt } from '@medusajs/ui';
import clsx from 'clsx';
import { FC, MouseEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAdminDeletePostSection,
  useAdminUpdatePostSection,
  useAdminDuplicatePostSection,
} from '../../../../hooks/post-sections-mutations';
import { usePost } from '../../../hooks/use-post';

export interface PostSectionListItemProps {
  index: number;
  section: PostSection;
}

export const PostSectionListItem: FC<PostSectionListItemProps> = ({ index, section }) => {
  const { post } = usePost();
  const prompt = usePrompt();
  const { mutateAsync: deletePostSection } = useAdminDeletePostSection();
  const { mutateAsync: duplicatePostSection } = useAdminDuplicatePostSection();

  const navigate = useNavigate();
  const { mutateAsync: updatePostSection } = useAdminUpdatePostSection();

  const handleEditClick = () => {
    // navigate(selectEditSectionPath(post, section.id));
    toast.warning('Not implemented');
  };

  const handleDuplicateClick: MouseEventHandler<HTMLDivElement> = async (event) => {
    event.stopPropagation();
    try {
      await duplicatePostSection(section.id);
      toast.success('Section duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate section');
      console.error('Failed to duplicate section:', error);
    }
  };

  const handlePublishClick: MouseEventHandler<HTMLDivElement> = async (event) => {
    console.log('handlePublishClick', section);
    event.stopPropagation();

    await updatePostSection({
      id: section.id,
      data: {
        status: 'published',
      },
    });
  };

  const handleUnpublishClick: MouseEventHandler<HTMLDivElement> = async (event) => {
    event.stopPropagation();

    await updatePostSection({
      id: section.id,
      data: {
        status: 'draft',
      },
    });
  };

  const handleDeleteClick: MouseEventHandler<HTMLDivElement> = async (event) => {
    event.stopPropagation();
    const confirmed = await prompt({
      title: 'Delete section',
      description: 'Are you sure you want to delete this section?',
      confirmText: 'Yes, delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await deletePostSection(section.id);
      return;
    }
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
          <IconButton variant="transparent" size="small">
            <EllipsisHorizontal />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="bg-grey-0 border-grey-20 rounded-rounded shadow-dropdown z-30 min-w-[160px] border py-2"
        >
          <DropdownMenu.Item onClick={handleEditClick}>Edit</DropdownMenu.Item>

          {section.status === 'published' && (
            <DropdownMenu.Item onClick={handleUnpublishClick}>Unpublish</DropdownMenu.Item>
          )}

          {section.status === 'draft' && <DropdownMenu.Item onClick={handlePublishClick}>Publish</DropdownMenu.Item>}

          <DropdownMenu.Item onClick={handleDuplicateClick}>Duplicate</DropdownMenu.Item>

          <DropdownMenu.Separator />

          <DropdownMenu.Item onClick={handleDeleteClick} className="">
            <Trash className="mr-2" /> Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </article>
  );
};
