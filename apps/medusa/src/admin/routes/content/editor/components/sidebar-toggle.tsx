import { SidebarLeft, SidebarRight } from "@medusajs/icons"
import { IconButton, Tooltip, TooltipProvider } from "@medusajs/ui"
import { useEditorSidebar } from "../hooks/use-editor-sidebar"

export const SidebarToggle = ({ side, drawerOnly = false }: { side: "left" | "right", drawerOnly?: boolean }) => {
  const { toggleLeft, toggleRight } = useEditorSidebar()
  const toggle = side === "left" ? toggleLeft : toggleRight
  const Icon = side === "left" ? SidebarLeft : SidebarRight

  return (
    <TooltipProvider>
    <Tooltip content={side === "left" ? "Toggle editor sidebar" : "Toggle post settings sidebar"}>
    <div>
      <IconButton
        className="hidden lg:flex"
        variant="transparent"
        onClick={() => toggle(drawerOnly ? "drawer" : "static")}
        size="small"
      >
        <Icon className="text-ui-fg-muted" />
      </IconButton>
      <IconButton
        className="hidden max-lg:flex"
        variant="transparent"
        onClick={() => toggle("drawer")}
        size="small"
      >
        <Icon className="text-ui-fg-muted" />
      </IconButton>
    </div>
    </Tooltip>
    </TooltipProvider>
  )
} 