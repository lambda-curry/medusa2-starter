import { ContentBlock, PostSection, PostSectionLayout, PostSectionStatus } from '@lambdacurry/page-builder-types';
import { PropsWithChildren, createContext } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { useAdminUpdatePostSection } from '../../../hooks/post-sections-mutations';

export type PostSectionFormValues = {
  title: string;
  status: PostSectionStatus;
  layout: PostSectionLayout;
  blocks: ContentBlock[];
};

const buildDefaultValues = (section: PostSection): PostSectionFormValues => {
  return {
    title: section.title ?? '',
    status: section.status ?? 'draft',
    layout: section.layout ?? ('full_width' as const),
    blocks: [],
  };
};

export const PostSectionContext = createContext<{
  section?: PostSection;
  form?: UseFormReturn<PostSectionFormValues>;
  save?: () => Promise<void>;
}>({
  section: undefined,
  form: undefined,
  save: undefined,
});

export interface PostSectionContextProviderProps extends PropsWithChildren {
  section: PostSection | undefined;
}

export const PostSectionContextProvider = ({ children, section }: PostSectionContextProviderProps) => {
  if (!section) {
    return null;
  }

  return <PostSectionContextSubProvider section={section}>{children}</PostSectionContextSubProvider>;
};

export const PostSectionContextSubProvider = ({ children, section }: PropsWithChildren<{ section: PostSection }>) => {
  const { mutateAsync } = useAdminUpdatePostSection();

  const defaultValues = buildDefaultValues(section);

  const form = useForm<PostSectionFormValues>({
    defaultValues,
  });

  const handleSubmit = async (data: PostSectionFormValues) => {
    const { section: updatedSection } = await mutateAsync({
      id: section?.id as string,
      data,
    });

    form.reset(buildDefaultValues(updatedSection));
  };

  return (
    <PostSectionContext.Provider value={{ section, form, save: form.handleSubmit(handleSubmit) }}>
      {children}
    </PostSectionContext.Provider>
  );
};
