import { ControlledInput, ControlledTextArea } from '@lambdacurry/medusa-forms';
import { Post } from '@lambdacurry/page-builder-types';
import { Button, Heading, Label, usePrompt } from '@medusajs/ui';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { FieldGroup } from '../../../components/inputs/Field/FieldGroup';
import FileUpload from '../../../components/inputs/Field/FileUpload';
import { useAdminDeletePost } from '../../../hooks/posts-mutations';
import { usePost } from '../../hooks/use-post';

type PostDetailsFormProps = {
  post: Post;
  afterSave?: () => Promise<void>;
  afterDelete?: () => Promise<void>;
};

export const PostDetailsForm = ({ post, afterSave, afterDelete }: PostDetailsFormProps) => {
  const prompt = usePrompt();

  const { mutateAsync: deletePost } = useAdminDeletePost();

  const { form, save } = usePost();

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: 'Delete Page',
      description: 'Are you sure you want to delete this page?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    await deletePost(post.id);

    if (afterDelete) {
      await afterDelete();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={save} className="space-y-6">
        <FieldGroup className="flex flex-col gap-2">
          <ControlledInput name="handle" label="Page Handle" placeholder="about" />

          <div className="mb-2" />
          <Heading level="h3">SEO & Social</Heading>

          <ControlledInput name="meta_title" label="Meta Title" placeholder="Defaults to page title" />

          <ControlledTextArea
            name="meta_description"
            label="Meta Description"
            placeholder="Enter a description for this page"
          />
          <div className="mb-2">
            <Label className="text-gray-500 mb-4" size="small">
              Image
            </Label>
            <FileUpload
              filetypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
              onFileChosen={(files: File[]) => setImageFile(files[0] || null)}
              placeholder="Images can be up to 10MB each, for products we recommend a 1:1 aspect ratio."
              text={
                <span>
                  Drop your image here, or <span className="text-violet-60">click to browse</span>
                </span>
              }
              multiple={false}
            />
            {imageFile && <div className="mt-2 text-xs text-gray-500">Selected: {imageFile.name}</div>}
          </div>
        </FieldGroup>
        <div className="flex gap-2 justify-between mt-8">
          <Button
            disabled={!form.formState.isValid || form.formState.isSubmitting || !form.formState.isDirty}
            type="submit"
            variant="primary"
            size="small"
          >
            Save
          </Button>
          <Button type="button" variant="danger" size="small" onClick={handleDelete}>
            Delete Page
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
