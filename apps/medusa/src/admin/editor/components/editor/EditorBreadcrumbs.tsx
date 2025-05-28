import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { usePost } from '../../hooks/use-post';

type Crumb = {
  label: string;
  path: string;
};

export const PostEditorBreadcrumbs = () => {
  const { post } = usePost();

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
      path: post.id as string,
    },
  ];

  return <Breadcrumbs crumbs={crumbs} />;
};
