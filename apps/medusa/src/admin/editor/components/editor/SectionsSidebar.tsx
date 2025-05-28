import { Plus, SquareTwoStackSolid } from '@medusajs/icons';
import { Button, DropdownMenu, Heading, Label, toast } from '@medusajs/ui';
import { FormProvider } from 'react-hook-form';
import { Sidebar } from '../../../components/Sidebar';
import { ControlledInput } from '../../../components/inputs/ControlledFields/ControlledInput';
import { useSectionsSidebar } from '../../../routes/content/editor/providers/SectionsSidebarContext';
import { usePost } from '../../hooks/use-post';
import { INavItem, NavItem } from './nav-item';
import { useAdminCreatePostSection } from '../../../hooks/post-sections-mutations';
import { useNavigate } from 'react-router-dom';

export const SectionsSidebar = () => {
  const { post } = usePost();
  const { isOpen, open, close, toggle } = useSectionsSidebar();

  const navItems: INavItem[] = (post?.sections ?? []).map((section) => ({
    icon: <SquareTwoStackSolid />,
    label: section.name,
    to: `/content/editor/${post?.id}/sections/${section.id}`,
  }));

  return (
    <>
      <Sidebar side="left" isOpen={isOpen} toggle={toggle} open={open} close={close}>
        <aside className="flex flex-1 flex-col overflow-y-auto p-4">
          <PostTitleForm className="mb-4" />
          <SectionsMenu navItems={navItems} />
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

const SectionsMenu = ({ navItems }: { navItems: INavItem[] }) => {
  return (
    <div className="mb-4">
      <Heading className="mb-2" level="h3">
        Sections
      </Heading>
      {!navItems.length && <p className="text-gray-500">No sections yet</p>}
      <nav className="flex flex-col gap-y-1">
        {navItems.map((item) => {
          return <NavItem key={item.to} {...item} />;
        })}
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
