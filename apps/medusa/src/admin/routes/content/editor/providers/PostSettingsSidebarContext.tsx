import { createContext, PropsWithChildren, useContext } from 'react';
import { useToggleState } from '@medusajs/ui';

export const usePostSettingsSidebar = () => {
  const context = useContext(PostSettingsSidebarContext);
  if (!context) {
    throw new Error('usePostSettingsSidebar must be used within a PostSettingsSidebarProvider');
  }
  return context;
};

export interface PostSettingsSidebarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const PostSettingsSidebarContext = createContext<PostSettingsSidebarContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export const PostSettingsSidebarProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, open, close, toggle] = useToggleState(false);

  return (
    <PostSettingsSidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </PostSettingsSidebarContext.Provider>
  );
};
