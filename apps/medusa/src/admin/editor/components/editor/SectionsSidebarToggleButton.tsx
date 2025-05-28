import { SidebarLeft } from '@medusajs/icons';
import { IconButton } from '@medusajs/ui';
import { useSectionsSidebar } from '../../../routes/content/editor/providers/SectionsSidebarContext';

export const SectionsSidebarToggleButton = () => {
  const { toggle } = useSectionsSidebar();
  return (
    <IconButton variant="transparent" onClick={() => toggle()} size="small">
      <SidebarLeft />
    </IconButton>
  );
};
