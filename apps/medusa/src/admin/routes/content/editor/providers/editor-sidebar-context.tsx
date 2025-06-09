import { createContext } from 'react';

export type SidebarViewType = 'drawer' | 'static';

export interface SidebarState {
  drawer: boolean;
  static: boolean;
}

export interface EditorSidebarContextType {
  sections: SidebarState;
  settings: SidebarState;
  toggleLeft: (viewType: SidebarViewType) => void;
  toggleRight: (viewType: SidebarViewType) => void;
}

export const PostEditorContext = createContext<EditorSidebarContextType>({
  sections: {
    drawer: false,
    static: true,
  },
  settings: {
    drawer: false,
    static: true,
  },
  toggleLeft: () => {},
  toggleRight: () => {},
});
