import { useContext } from "react"
import { EditorSidebarContext, EditorSidebarContextType } from "../providers/editor-sidebar-context"

export const useEditorSidebar = (): EditorSidebarContextType => {
  const context = useContext(EditorSidebarContext)

  if (!context) {
    throw new Error("useEditorSidebar must be used within a EditorSidebarProvider")
  }

  return context
}
