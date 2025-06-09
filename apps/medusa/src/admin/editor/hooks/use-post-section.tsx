import { useContext } from 'react';
import { PostSectionContext } from '../components/editor/PostSectionContextProvider';

export const usePostSection = () => {
  const { section, form, save } = useContext(PostSectionContext);

  return { section, form, save };
};
