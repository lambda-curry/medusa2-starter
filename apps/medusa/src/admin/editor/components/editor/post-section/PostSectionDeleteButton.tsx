import { PostSection } from '@lambdacurry/page-builder-types';
import { useAdminDeletePostSection } from '../../../../hooks/post-sections-mutations';
import { Button, usePrompt } from '@medusajs/ui';
import { FC, PropsWithChildren } from 'react';

export interface PostSectionDeleteButtonProps extends PropsWithChildren {
  postSection: PostSection;
  onDelete?: (postSection: PostSection) => void;
  onCancel?: () => void;
  className?: string;
  size?: React.ComponentProps<typeof Button>['size'];
}

export const PostSectionDeleteButton: FC<PostSectionDeleteButtonProps> = ({
  postSection,
  onDelete,
  onCancel,
  children,
  className,
}) => {
  const { mutateAsync: deletePostSection } = useAdminDeletePostSection();
  const prompt = usePrompt();

  const handleClick = async () => {
    const confirmed = await prompt({
      title: 'Delete section',
      description: 'Are you sure you want to delete this section?',
      confirmText: 'Yes, delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await deletePostSection(postSection.id);
      onDelete?.(postSection);
      return;
    }

    onCancel?.();
    return;
  };

  if (!postSection) {
    return null;
  }

  return (
    <Button variant="danger" onClick={handleClick} className={className}>
      {children}
    </Button>
  );
};
