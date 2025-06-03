import { Button } from '@medusajs/ui';
import { PostEditorBreadcrumbs } from './EditorBreadcrumbs';
import { SettingsSidebarToggleButton } from './SettingsSidebarToggleButton';
import { SectionsSidebarToggleButton } from './SectionsSidebarToggleButton';
import { usePost } from '../../hooks/use-post';

export const EditorTopbar = () => {
  const { form, save } = usePost();

  return (
    <div className="flex w-full items-center justify-between p-3">
      <div className="flex items-center gap-x-1.5">
        <SectionsSidebarToggleButton />
        <PostEditorBreadcrumbs />
      </div>
      <div className="flex items-center gap-x-1.5">
        <Button
          variant="primary"
          size="small"
          onClick={save}
          disabled={!form.formState.isDirty || form.formState.isSubmitting}
        >
          Save
        </Button>
        <SettingsSidebarToggleButton />
      </div>
    </div>
  );
};
