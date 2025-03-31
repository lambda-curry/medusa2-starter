import { PropsWithChildren, useState } from "react"
import { EditorSidebarContext, SidebarState, SidebarViewType } from "./editor-sidebar-context"

/**
 * Provider for the editor sidebar state
 * Manages the visibility state of left and right sidebars
 * with separate states for drawer and static views
 */
export const EditorSidebarProvider = ({ children }: PropsWithChildren) => {
  const [leftSidebar, setLeftSidebar] = useState<SidebarState>({
    drawer: false,
    static: true
  })

  const [rightSidebar, setRightSidebar] = useState<SidebarState>({
    drawer: false,
    static: false
  })

  const toggleLeft = (viewType: SidebarViewType) => {
    setLeftSidebar((prev) => ({
      ...prev,
      [viewType]: !prev[viewType],
    }))
  }

  const toggleRight = (viewType: SidebarViewType) => {
    setRightSidebar((prev) => ({
      ...prev,
      [viewType]: !prev[viewType],
    }))
  }

  return (
    <EditorSidebarContext.Provider
      value={{
        left: leftSidebar,
        right: rightSidebar,
        toggleLeft,
        toggleRight,
      }}
    >
      {children}
    </EditorSidebarContext.Provider>
  )
}
