import { Post, PostStatus } from '@lambdacurry/page-builder-types';
import { PropsWithChildren, createContext } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { useAdminUpdatePost } from '../../../hooks/posts-mutations';

export type PostFormValues = {
  title: string;
  handle?: string;
  status: PostStatus;
  meta_title?: string;
  meta_description?: string;
  meta_image_url?: string;
};

const buildDefaultValues = (post: Post): PostFormValues => {
  return {
    title: post.title ?? '',
    handle: post.handle ?? '',
    status: post.status ?? 'draft',
    meta_title: '',
    meta_description: '',
    meta_image_url: '',
  };
};

export const PostContext = createContext<{
  post: Post | undefined;
  form: UseFormReturn<PostFormValues>;
  save: () => Promise<void>;
}>({
  post: undefined,
  form: null as unknown as UseFormReturn<PostFormValues>,
  save: async () => {},
});

export interface PostContextProviderProps extends PropsWithChildren {
  post: Post | undefined;
}

export const PostContextProvider = ({ children, post }: PostContextProviderProps) => {
  if (!post) {
    return null;
  }

  return <PostContextSubProvider post={post}>{children}</PostContextSubProvider>;
};

export const PostContextSubProvider = ({ children, post }: PropsWithChildren<{ post: Post }>) => {
  const { mutateAsync } = useAdminUpdatePost();

  const form = useForm<PostFormValues>({
    defaultValues: buildDefaultValues(post),
  });

  const handleSubmit = async (data: PostFormValues) => {
    const updatedPost = await mutateAsync({
      id: post?.id as string,
      data: {
        title: data.title,
        handle: data.handle,
        // meta_title: data.meta_title,
        // meta_description: data.meta_description,
        // meta_image: data.meta_image,
      },
    });

    form.reset(buildDefaultValues(updatedPost.post));
  };

  return (
    <PostContext.Provider value={{ post, form, save: form.handleSubmit(handleSubmit) }}>
      {children}
    </PostContext.Provider>
  );
};
