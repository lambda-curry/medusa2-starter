import { useContext } from 'react';
import {
  PostEditorContext,
  EditorSidebarContextType,
} from '../../routes/content/editor/providers/editor-sidebar-context';

export const useEditorSidebar = (): EditorSidebarContextType => {
  const context = useContext(PostEditorContext);

  if (!context) {
    throw new Error('useEditorSidebar must be used within a EditorSidebarProvider');
  }

  return context;
};
