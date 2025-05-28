import { useSettingsSidebar } from '../../../routes/content/editor/providers/SettingsSidebarContext';
import { IconButton } from '@medusajs/ui';
import { CogSixTooth } from '@medusajs/icons';

export const SettingsSidebarToggleButton = () => {
  const { toggle } = useSettingsSidebar();
  return (
    <IconButton variant="transparent" onClick={() => toggle()} size="small">
      <CogSixTooth />
    </IconButton>
  );
};
