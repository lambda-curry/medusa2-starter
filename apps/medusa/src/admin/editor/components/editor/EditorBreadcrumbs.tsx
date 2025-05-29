import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { usePost } from '../../hooks/use-post';
import { usePostSection } from '../../hooks/use-post-section';

type Crumb = {
  label: string;
  path: string;
};

export const PostEditorBreadcrumbs = () => {
  const { post } = usePost();
  const { section } = usePostSection();

  const crumbs: Crumb[] = [
    {
      label: 'Home',
      path: '/',
    },
    {
      label: 'Content',
      path: '/content',
    },
    {
      label: post.title as string,
      path: `/content/editor/${post.id}`,
    },
  ];

  if (section) {
    crumbs.push({
      label: section.title as string,
      path: `/content/editor/${post.id}/section/${section.id}`,
    });
  }

  return <Breadcrumbs crumbs={crumbs} />;
};
