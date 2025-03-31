import { createContext } from "react"

export type SidebarViewType = "drawer" | "static"

export interface SidebarState {
  drawer: boolean
  static: boolean
}

export interface EditorSidebarContextType {
  left: SidebarState
  right: SidebarState
  toggleLeft: (viewType: SidebarViewType) => void
  toggleRight: (viewType: SidebarViewType) => void
}

export const EditorSidebarContext = createContext<EditorSidebarContextType>({
  left: {
    drawer: false,
    static: true
  },
  right: {
    drawer: false,
    static: false
  },
  toggleLeft: () => {},
  toggleRight: () => {},
})
