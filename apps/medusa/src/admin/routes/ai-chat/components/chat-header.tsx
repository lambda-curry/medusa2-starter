import { Button } from '@medusajs/ui';
import { Plus } from '@medusajs/icons';

interface ChatHeaderProps {
  onNewChat: () => void;
}

export const ChatHeader = ({ onNewChat }: ChatHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-ui-bg-base border-b border-ui-border-base">
      <h1 className="text-sm font-semibold">AI Chat</h1>
      <Button variant="secondary" size="small" onClick={onNewChat}>
        New Chat
        <Plus className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};
