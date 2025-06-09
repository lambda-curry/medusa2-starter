import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PostSection, PostSectionLayout } from '@lambdacurry/page-builder-types';
import { Plus } from '@medusajs/icons';
import { Button, DropdownMenu, Heading, toast } from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { ControlledInput } from '@lambdacurry/medusa-forms';
import { useAdminCreatePostSection } from '../../../hooks/post-sections-mutations';
import { useAdminReorderPostSections } from '../../../hooks/posts-mutations';
import { usePost } from '../../hooks/use-post';
import { PostSectionListItem } from './post-section/PostSectionListItem';

export const PostSectionsSidebarContent = ({ className }: { className?: string }) => {
  const { post } = usePost();
  return (
    <div className={className}>
      <PostTitleForm className="mb-4" />
      <SectionsMenu sections={post?.sections ?? []} />
      <CreateSectionButton />
    </div>
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

const SectionsMenu = ({ sections: _sections }: { sections: PostSection[] }) => {
  const { post } = usePost();

  const [sections, setSections] = useState<PostSection[]>(_sections);

  useEffect(() => {
    setSections(_sections);
  }, [_sections]);

  const { mutateAsync: reorderSections } = useAdminReorderPostSections();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);

      // Create a new array with the reordered sections
      const reorderedSections = arrayMove(post?.sections ?? [], oldIndex, newIndex);

      setSections(reorderedSections);

      await reorderSections({
        id: post?.id as string,
        data: {
          section_ids: reorderedSections.map((section) => section.id),
        },
      });
    }
  };

  return (
    <div className="mb-4">
      <Heading className="mb-2" level="h3">
        Sections
      </Heading>
      {!sections.length && <p className="text-gray-500">No sections yet</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
          <nav className="flex flex-col gap-y-1">
            {sections.map((item, index) => (
              <PostSectionListItem key={item.id} section={item} index={index} />
            ))}
          </nav>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const CreateSectionButton = () => {
  const { post } = usePost();

  const createSection = useAdminCreatePostSection();

  const handleCreateSection = async (layout: PostSectionLayout) => {
    if (!post?.id) return;

    try {
      const result = await createSection.mutateAsync({
        title: `New ${layout.replace('_', ' ')} section`,
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
