import { Message } from '../types';
import { ChatScrollArea } from './chat-scroll-area';
import { clx } from '@medusajs/ui';
import { ChatStatus } from './ai-chat';
import { memo } from 'react';

interface ChatMessagesProps {
  messages: Message[];
  streamingMessage: Message | null;
  chatId?: string;
  status?: ChatStatus;
  className?: string;
}

export const ChatMessages = memo(({ className, messages, streamingMessage, ...props }: ChatMessagesProps) => {
  return (
    <div className={clx('flex flex-col relative', className)}>
      <ChatScrollArea messages={messages} streamingMessage={streamingMessage} {...props} />
    </div>
  );
});
