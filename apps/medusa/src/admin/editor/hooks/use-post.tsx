import { useContext } from 'react';
import { PostContext } from '../components/editor/PostContextProvider';

export const usePost = () => {
  const { post, form, save } = useContext(PostContext);

  if (!post) {
    throw new Error('Post is not found');
  }

  return { post, form, save };
};
