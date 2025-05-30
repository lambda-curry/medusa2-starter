import { createContext, PropsWithChildren, useContext } from 'react';
import { useToggleState } from '@medusajs/ui';

export interface PostSectionsSidebarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const PostSectionsSidebarContext = createContext<PostSectionsSidebarContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export const usePostSectionsSidebar = () => {
  const context = useContext(PostSectionsSidebarContext);
  if (!context) {
    throw new Error('useSectionsSidebar must be used within a SectionsSidebarProvider');
  }
  return context;
};

export const PostSectionsSidebarProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, open, close, toggle] = useToggleState(true);

  return (
    <PostSectionsSidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </PostSectionsSidebarContext.Provider>
  );
};
