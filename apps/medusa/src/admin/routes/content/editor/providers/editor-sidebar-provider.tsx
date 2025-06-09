import { PropsWithChildren, useState } from 'react';
import { PostEditorContext, SidebarState, SidebarViewType } from './editor-sidebar-context';

/**
 * Provider for the editor sidebar state
 * Manages the visibility state of left and right sidebars
 * with separate states for drawer and static views
 */
export const EditorSidebarProvider = ({ children }: PropsWithChildren) => {
  const [sectionsSidebar, setSectionsSidebar] = useState<SidebarState>({
    drawer: false,
    static: true,
  });

  const [settingsSidebar, setSettingsSidebar] = useState<SidebarState>({
    drawer: false,
    static: true,
  });

  const toggleSectionsSidebar = (viewType: SidebarViewType) => {
    setSectionsSidebar((prev) => ({
      ...prev,
      [viewType]: !prev[viewType],
    }));
  };

  const toggleSettingsSidebar = (viewType: SidebarViewType) => {
    setSettingsSidebar((prev) => ({
      ...prev,
      [viewType]: !prev[viewType],
    }));
  };

  return (
    <PostEditorContext.Provider
      value={{
        sections: sectionsSidebar,
        settings: settingsSidebar,
        toggleLeft: toggleSectionsSidebar,
        toggleRight: toggleSettingsSidebar,
      }}
    >
      {children}
    </PostEditorContext.Provider>
  );
};
