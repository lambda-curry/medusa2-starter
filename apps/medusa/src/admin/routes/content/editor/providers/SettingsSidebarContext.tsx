import { createContext, PropsWithChildren, useContext } from 'react';
import { useToggleState } from '@medusajs/ui';

export const useSettingsSidebar = () => {
  const context = useContext(SettingsSidebarContext);
  if (!context) {
    throw new Error('useSettingsSidebar must be used within a SettingsSidebarProvider');
  }
  return context;
};

export interface EditorSidebarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const SettingsSidebarContext = createContext<EditorSidebarContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export const SettingsSidebarProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, open, close, toggle] = useToggleState(false);

  return (
    <SettingsSidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SettingsSidebarContext.Provider>
  );
};
