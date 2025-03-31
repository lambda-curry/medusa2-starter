import { PropsWithChildren } from "react"
import { TooltipProvider } from "@medusajs/ui"

import { MainContent } from "./main-content"
import { EditorSidebar } from "./editor-sidebar"
import { PostSettingsSidebar } from "./post-settings-sidebar"

type PostEditorLayoutProps = PropsWithChildren

export const PostEditorLayout = ({ children }: PostEditorLayoutProps) => {
  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <EditorSidebar />
        <MainContent>{children}</MainContent>
        <PostSettingsSidebar />
      </div>
    </TooltipProvider>
  )
} 