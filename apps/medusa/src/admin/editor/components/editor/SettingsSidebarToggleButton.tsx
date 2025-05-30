import { usePostSettingsSidebar } from '../../../routes/content/editor/providers/PostSettingsSidebarContext';
import { IconButton } from '@medusajs/ui';
import { CogSixTooth } from '@medusajs/icons';

export const SettingsSidebarToggleButton = () => {
  const { toggle } = usePostSettingsSidebar();
  return (
    <IconButton variant="transparent" onClick={() => toggle()} size="small">
      <CogSixTooth />
    </IconButton>
  );
};
