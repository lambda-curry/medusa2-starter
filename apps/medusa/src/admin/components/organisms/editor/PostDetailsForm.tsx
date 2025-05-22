import { useForm, FormProvider } from 'react-hook-form';
import { ControlledInput } from '../../inputs/ControlledFields/ControlledInput';
import { ControlledTextArea } from '../../inputs/ControlledFields/ControlledTextArea';
import FileUpload from '../../inputs/Field/FileUpload';
import { Button, usePrompt } from '@medusajs/ui';
import { FieldGroup } from '../../inputs/Field/FieldGroup';
import { useState } from 'react';
import { useAdminDeletePost, useAdminUpdatePost } from '../../../hooks/posts-mutations';
import { Post } from '@lambdacurry/page-builder-types';

export type PageFormValues = {
  handle: string;
  title: string;
  description: string;
  image: File | null;
};

type PostDetailsFormProps = {
  post: Post;
  afterSave?: () => Promise<void>;
  afterDelete?: () => Promise<void>;
};

export const PostDetailsForm = ({ post, afterSave, afterDelete }: PostDetailsFormProps) => {
  const prompt = usePrompt();

  const { mutateAsync: deletePost } = useAdminDeletePost();
  const { mutateAsync: updatePost } = useAdminUpdatePost();

  const methods = useForm<PageFormValues>({
    defaultValues: {
      handle: post.handle ?? undefined,
      title: post.title,
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (data: PageFormValues) => {
    await updatePost({
      id: post.id,
      data: {
        handle: data.handle,
        title: data.title,
      },
    });

    if (afterSave) {
      await afterSave();
    }
  };

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
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Page settings</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
          <FieldGroup className="flex flex-col gap-2">
            <ControlledInput name="handle" label="Page handle" required placeholder="about" />
            <ControlledInput name="title" label="Title" required placeholder="Defaults to page title" />
            <ControlledTextArea
              name="description"
              label="Description"
              placeholder="Enter a description for this page"
            />
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
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
            <Button type="submit" variant="primary" size="small">
              Save
            </Button>
            <Button type="button" variant="danger" size="small" onClick={handleDelete}>
              Delete Page
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
