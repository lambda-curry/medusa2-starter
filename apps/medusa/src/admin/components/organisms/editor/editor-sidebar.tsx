import { SquareTwoStackSolid } from "@medusajs/icons"

import { SidebarContainer } from "./sidebar-container"
import { INavItem, NavItem } from "./nav-item"

export const EditorSidebar = () => {
  const sidebarContent = (
    <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
      <SectionsMenu />
    </aside>
  )

  return (
    <>
      <SidebarContainer.Drawer side="left" title="Editor">
        {sidebarContent}
      </SidebarContainer.Drawer>
      <SidebarContainer.Static side="left">
        {sidebarContent}
      </SidebarContainer.Static>
    </>
  )
}

const sections: INavItem[] = [
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 1',
    to: "sections/section_id_1",
  },
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 2',
    to: "sections/section_id_2",
  },
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 3',
    to: "sections/section_id_3",
  },
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 4',
    to: "sections/section_id_4",
  },
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 5',
    to: "sections/section_id_5",
  },
]

const SectionsMenu = () => {
  return (
    <nav className="flex flex-col gap-y-1 py-5">
      {sections.map((section) => {
        return <NavItem key={section.to} {...section} />
      })}
    </nav>
  )
} 