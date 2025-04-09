import { FocusModal, TooltipProvider, Drawer } from '@medusajs/ui';
import * as Portal from '@radix-ui/react-portal';
import { useKeyboardShortcut } from '../../../../hooks/use-keyboard-shortcut';
import { useChatState } from '../../../../hooks/use-chat-state';
import { useLocation } from 'react-router-dom';
import { ChatContent } from './chat-content';
import { TriggerButton } from './trigger-button';
import { isMacKeyboard } from '../../../../utils/is-mac-keyboard';
import { useChatSession } from '../../../../hooks/use-chat-session';

export const ChatPortal = () => {
  // Create a QueryClient instance for the devtools
  const {
    status,
    setStatus,
    lastOpenStatus,
    drawerDirection,
    handleChatToggle,
    handleViewToggle,
    handleDirectionToggle,
  } = useChatState();
  const { pathname } = useLocation();
  const isMac = isMacKeyboard();
  const { startNewChat } = useChatSession();

  useKeyboardShortcut({
    keys: [isMac ? 'cmd' : 'ctrl', '.'],
    callback: handleChatToggle,
  });

  useKeyboardShortcut({
    keys: [isMac ? 'cmd' : 'ctrl', 'shift', '.'],
    callback: handleViewToggle,
  });

  useKeyboardShortcut({
    keys: [isMac ? 'cmd' : 'ctrl', 'shift', 'm'],
    callback: handleDirectionToggle,
  });

  const shouldHideButton = pathname.includes('ai-chat');
  if (shouldHideButton) return null;

  const tooltipContent = `${isMac ? '⌘' : 'Ctrl'} + .`;

  const ChatContentComponent = () => (
    <ChatContent
      onClose={() => setStatus('closed')}
      onExpand={handleViewToggle}
      onNewChat={startNewChat}
      onDirectionToggle={handleDirectionToggle}
      status={status}
      drawerDirection={drawerDirection}
    />
  );

  // Left drawer animation and positioning classes
  const leftDrawerClasses =
    '!left-2 !right-auto ' +
    'data-[state=open]:!slide-in-from-left-1/2 ' +
    'data-[state=closed]:!slide-out-to-left-1/2';

  // Right drawer animation and positioning classes
  const rightDrawerClasses =
    '!right-2 !left-auto ' +
    'data-[state=open]:!slide-in-from-right-1/2 ' +
    'data-[state=closed]:!slide-out-to-right-1/2';

  const drawerPositionClasses = drawerDirection === 'left' ? leftDrawerClasses : rightDrawerClasses;

  return (
    <TooltipProvider>
      <Portal.Root
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {status === 'modal' || lastOpenStatus === 'modal' ? (
          <FocusModal open={status === 'modal'} onOpenChange={(open) => setStatus(open ? 'modal' : 'closed')}>
            <TriggerButton
              onClick={handleChatToggle}
              triggerComponent={<FocusModal.Trigger />}
              tooltipContent={tooltipContent}
            />
            <FocusModal.Content>
              <ChatContentComponent />
            </FocusModal.Content>
          </FocusModal>
        ) : (
          <Drawer open={status === 'drawer'} onOpenChange={(open) => setStatus(open ? 'drawer' : 'closed')}>
            <TriggerButton
              onClick={handleChatToggle}
              triggerComponent={<Drawer.Trigger />}
              tooltipContent={tooltipContent}
            />
            <Drawer.Content
              className={`!max-w-sm ${drawerPositionClasses}`}
              overlayProps={{
                className: 'hidden',
              }}
            >
              <ChatContentComponent />
            </Drawer.Content>
          </Drawer>
        )}
      </Portal.Root>
    </TooltipProvider>
  );
};
