import { Plus, SquareTwoStackSolid } from '@medusajs/icons';
import { Button, DropdownMenu, Label } from '@medusajs/ui';
import { FormProvider } from 'react-hook-form';
import { Sidebar } from '../../../components/Sidebar';
import { ControlledInput } from '../../../components/inputs/ControlledFields/ControlledInput';
import { useSectionsSidebar } from '../../../routes/content/editor/providers/SectionsSidebarContext';
import { usePost } from '../../hooks/use-post';
import { INavItem, NavItem } from './nav-item';

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
        <ControlledInput name="title" label="Title" />
      </FormProvider>
    </div>
  );
};

const SectionsMenu = ({ navItems }: { navItems: INavItem[] }) => {
  return (
    <>
      <Label className="mb-4" size="large" weight="plus">
        Sections
      </Label>
      {!navItems.length && <p className="text-gray-500">No sections yet</p>}
      <nav className="flex flex-col gap-y-1 py-5">
        {navItems.map((item) => {
          return <NavItem key={item.to} {...item} />;
        })}
      </nav>
    </>
  );
};

const CreateSectionButton = () => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button className="w-full h-12" variant="secondary" size="large">
          <Plus />
          Add a section
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Item className="gap-x-2">Full Width Layout</DropdownMenu.Item>

        <DropdownMenu.Item className="gap-x-2">Two Column Layout</DropdownMenu.Item>

        <DropdownMenu.Item className="gap-x-2">Grid Layout</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
