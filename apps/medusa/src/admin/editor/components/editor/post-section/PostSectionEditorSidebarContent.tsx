import { ArrowLeft } from '@medusajs/icons';
import { Button, IconButton, Tabs } from '@medusajs/ui';
import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ControlledInput } from '../../../../components/inputs/ControlledFields/ControlledInput';
import { usePostSection } from '../../../hooks/use-post-section';

export const PostSectionEditorSidebarContent = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <Header />
      <PostSectionEditorForm />
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row justify-between h-10 items-center border-b border-ui-border-subtle pb-2 mb-4">
      <IconButton variant="transparent" size="small" onClick={() => navigate('../..')}>
        <ArrowLeft />
      </IconButton>

      <SaveButton />
    </div>
  );
};

const SaveButton = () => {
  const { save, form } = usePostSection();
  return (
    <Button onClick={save} disabled={!form?.formState.isDirty} variant="secondary" size="small">
      Save
    </Button>
  );
};

const PostSectionEditorForm = () => {
  const { section, form } = usePostSection();

  if (!section || !form) return null;

  return (
    <FormProvider {...form}>
      <ControlledInput name="title" label="Title" />
      <div className="mt-4">
        <Tabs defaultValue="content" className="w-full">
          <Tabs.List>
            <Tabs.Trigger value="content">Content</Tabs.Trigger>
            <Tabs.Trigger value="style">Styles</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="mt-4" value="content">
            Content Form Here!
          </Tabs.Content>
          <Tabs.Content className="mt-4" value="style">
            Styles Form Here!
          </Tabs.Content>
        </Tabs>
      </div>
    </FormProvider>
  );
};
