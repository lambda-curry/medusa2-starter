import { PostSection } from '@lambdacurry/page-builder-types';
import { Plus } from '@medusajs/icons';
import { Button, DropdownMenu, Heading, toast } from '@medusajs/ui';
import { FormProvider } from 'react-hook-form';
import { Sidebar } from '../../../components/Sidebar';
import { ControlledInput } from '../../../components/inputs/ControlledFields/ControlledInput';
import { useAdminCreatePostSection } from '../../../hooks/post-sections-mutations';
import { useSectionsSidebar } from '../../../routes/content/editor/providers/SectionsSidebarContext';
import { usePost } from '../../hooks/use-post';
import { PostSectionListItem } from './post-section/PostSectionListItem';

export const SectionsSidebar = () => {
  const { post } = usePost();
  const { isOpen, open, close, toggle } = useSectionsSidebar();

  return (
    <>
      <Sidebar side="left" isOpen={isOpen} toggle={toggle} open={open} close={close} className="min-w-[375px]">
        <aside className="flex flex-1 flex-col overflow-y-auto p-4">
          <PostTitleForm className="mb-4" />
          <SectionsMenu sections={post?.sections ?? []} />
          <CreateSectionButton />
        </aside>
      </Sidebar>
    </>
  );
};

const PostTitleForm = ({ className }: { className?: string }) => {
  const { form } = usePost();

  return (
    <div className={className}>
      <FormProvider {...form}>
        <Heading className="mb-2" level="h3">
          Page Title
        </Heading>
        <ControlledInput name="title" />
      </FormProvider>
    </div>
  );
};

const SectionsMenu = ({ sections }: { sections: PostSection[] }) => {
  return (
    <div className="mb-4">
      <Heading className="mb-2" level="h3">
        Sections
      </Heading>
      {!sections.length && <p className="text-gray-500">No sections yet</p>}
      <nav className="flex flex-col gap-y-1">
        {sections.map((item, index) => (
          <PostSectionListItem key={item.id} section={item} index={index} />
        ))}
      </nav>
    </div>
  );
};

const CreateSectionButton = () => {
  const { post } = usePost();

  const createSection = useAdminCreatePostSection();

  const handleCreateSection = async (layout: 'full_width' | 'two_column' | 'grid') => {
    if (!post?.id) return;

    try {
      const result = await createSection.mutateAsync({
        name: `New ${layout.replace('_', ' ')} section`,
        layout,
        blocks: {},
        post_id: post.id,
        sort_order: post.sections?.length || 0,
      });

      if (result.section) toast.success('Section created successfully');
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button className="w-full h-12" variant="secondary" size="large">
          <Plus />
          Add a section
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Item className="gap-x-2" onClick={() => handleCreateSection('full_width')}>
          Full Width Layout
        </DropdownMenu.Item>

        <DropdownMenu.Item className="gap-x-2" onClick={() => handleCreateSection('two_column')}>
          Two Column Layout
        </DropdownMenu.Item>

        <DropdownMenu.Item className="gap-x-2" onClick={() => handleCreateSection('grid')}>
          Grid Layout
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
