import { XMark } from "@medusajs/icons"
import { Drawer, IconButton, clx } from "@medusajs/ui"
import { PropsWithChildren } from "react"
import { useEditorSidebar } from "../hooks/use-editor-sidebar"

type DrawerSidebarContainerProps = PropsWithChildren & {
  title?: string
  side?: "left" | "right"
}

const DrawerSidebarContainer = ({ title, children, side = "left" }: DrawerSidebarContainerProps) => {
  const { left, right, toggleLeft, toggleRight } = useEditorSidebar()
  
  const isOpen = side === "left" ? left.drawer : right.drawer
  const toggle = side === "left" 
    ? () => toggleLeft("drawer") 
    : () => toggleRight("drawer")

  return (
    <Drawer open={isOpen} onOpenChange={toggle}>
      <Drawer.Content
        className={clx(
          {
            "left-2": side === "left",
            "right-2": side === "right"
          }
        )}
      >
          <div className="p-3 flex justify-between">
           <Drawer.Title>{title}</Drawer.Title>
            <IconButton
              size="small"
              variant="transparent"
              className="text-ui-fg-subtle"
              onClick={toggle}
              >
              <XMark />
            </IconButton>
          </div>
          <div className="p-3">
            {children}
          </div>
      </Drawer.Content>
    </Drawer>
  )
} 

const StaticSidebarContainer = ({ children, side = "left" }: PropsWithChildren & { side?: "left" | "right" }) => {
  const { left, right } = useEditorSidebar()
  const isOpen = side === "left" ? left.static : right.static

  return (
    <div
      className={clx("hidden h-screen w-[220px]", {
        "lg:flex": isOpen,
        "border-r": side === "left",
        "border-l": side === "right",
      })}
    >
      {children}
    </div>
  )
} 

export const SidebarContainer = {
  Drawer: DrawerSidebarContainer,
  Static: StaticSidebarContainer
}