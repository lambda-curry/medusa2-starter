import { createContext, PropsWithChildren, useContext } from 'react';
import { useToggleState } from '@medusajs/ui';

export const SectionsSidebarContext = createContext<EditorSidebarContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export const useSectionsSidebar = () => {
  const context = useContext(SectionsSidebarContext);
  if (!context) {
    throw new Error('useSectionsSidebar must be used within a SectionsSidebarProvider');
  }
  return context;
};

export interface EditorSidebarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const SectionsSidebarProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, open, close, toggle] = useToggleState(true);

  return (
    <SectionsSidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SectionsSidebarContext.Provider>
  );
};
