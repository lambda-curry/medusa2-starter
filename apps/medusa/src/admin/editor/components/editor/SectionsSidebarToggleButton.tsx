import { SidebarLeft } from '@medusajs/icons';
import { IconButton } from '@medusajs/ui';
import { usePostSectionsSidebar } from '../../../routes/content/editor/providers/PostSectionsSidebarContext';

export const SectionsSidebarToggleButton = () => {
  const { toggle } = usePostSectionsSidebar();
  return (
    <IconButton variant="transparent" onClick={() => toggle()} size="small">
      <SidebarLeft />
    </IconButton>
  );
};
