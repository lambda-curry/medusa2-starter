import { ChatBubbleLeftRight, XMark, CaretMaximizeDiagonal, CaretMinimizeDiagonal, Plus } from '@medusajs/icons';
import { Button, Tooltip } from '@medusajs/ui';
import { AiChat } from '../ai-chat';
import { ChatStatus, DrawerDirection } from '../../../../hooks/use-chat-state';
import { isMacKeyboard } from '../../../../utils/is-mac-keyboard';
import { ArrowDown } from '@medusajs/icons';

interface ChatContentProps {
  onClose: () => void;
  onExpand: () => void;
  onNewChat: () => void;
  onDirectionToggle: () => void;
  status: ChatStatus;
  drawerDirection: DrawerDirection;
}

export const ChatContent = ({
  onClose,
  onExpand,
  onNewChat,
  onDirectionToggle,
  status,
  drawerDirection,
}: ChatContentProps) => {
  const macKeyboard = isMacKeyboard();
  const isModal = status === 'modal';
  const ToggleIcon = isModal ? CaretMinimizeDiagonal : CaretMaximizeDiagonal;
  const toggleTooltip = isModal
    ? `Minimize to drawer (${macKeyboard ? '⌘ + Shift + .' : 'Ctrl + Shift + .'})`
    : `Expand to modal (${macKeyboard ? '⌘ + Shift + .' : 'Ctrl + Shift + .'})`;
  const closeTooltip = `Close (${macKeyboard ? '⌘ + .' : 'Ctrl + .'})`;
  const newChatTooltip = 'Start a new chat';
  const directionTooltip = `Toggle drawer position to ${drawerDirection === 'right' ? 'left' : 'right'} (${macKeyboard ? '⌘ + Shift + M' : 'Ctrl + Shift + M'})`;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ui-border-base p-2">
        <div className="flex items-center gap-x-2">
          <Tooltip content={closeTooltip}>
            <Button variant="transparent" size="small" className="h-8 w-8 p-0" onClick={onClose}>
              <XMark />
            </Button>
          </Tooltip>
          <ChatBubbleLeftRight />
          <span className="font-semibold">AI Chat</span>
        </div>
        <div className="flex items-center gap-x-2">
          {status === 'drawer' && (
            <Tooltip content={directionTooltip}>
              <Button variant="transparent" size="small" className="h-8 w-8 p-0" onClick={onDirectionToggle}>
                <ArrowDown className={`${drawerDirection === 'left' ? '-rotate-90' : 'rotate-90'}`} />
              </Button>
            </Tooltip>
          )}
          <Tooltip content={newChatTooltip}>
            <Button variant="transparent" size="small" className="h-8 w-8 p-0" onClick={onNewChat}>
              <Plus />
            </Button>
          </Tooltip>
          <Tooltip content={toggleTooltip}>
            <Button variant="transparent" size="small" className="h-8 w-8 p-0" onClick={onExpand}>
              <ToggleIcon />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 bg-ui-bg-subtle">
        <AiChat className="w-full" showHeader={false} />
      </div>
    </div>
  );
};
