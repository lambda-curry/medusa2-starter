import { useRef, memo } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Message } from '../types';
import { MessageBubble } from './message-bubble';
import { ScrollToBottomButton } from './scroll-to-bottom-button';
import { ChatStatus } from './ai-chat';
import { useChatScroll } from '../../../hooks/use-chat-scroll';

interface ChatScrollAreaProps {
  messages: Message[];
  streamingMessage: Message | null;
  chatId?: string;
  status?: ChatStatus;
}

// Memoize individual static messages
const StaticMessage = memo(({ message }: { message: Message }) => <MessageBubble key={message.id} message={message} />);

export const ChatScrollArea = ({ messages, streamingMessage, chatId, status }: ChatScrollAreaProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  // Use our custom chat scroll hook for all scrolling logic
  const { isScrolledUp, scrollToBottom } = useChatScroll({
    viewportRef,
    chatId,
    status,
    messagesCount: messages.length,
    streamingScrollInterval: 200, // Adjust this value as needed for performance
  });

  return (
    <ScrollArea.Root key={chatId} className="h-full w-full relative [&>div>div]:!block">
      <ScrollArea.Viewport
        className="h-full w-full overflow-y-auto touch-pan-y @container/chat"
        ref={viewportRef}
        key={chatId}
        style={{ overflowAnchor: 'none' }}
      >
        <div className="space-y-4 p-4 pb-16">
          {/* Static messages with memo to prevent re-renders */}
          {messages.map((message) => (
            <StaticMessage key={message.id} message={message} />
          ))}

          {/* Streaming message handled separately */}
          {streamingMessage && (
            <MessageBubble
              status={status}
              key={streamingMessage.id}
              message={streamingMessage}
              isStreamingMessage={true}
            />
          )}

          {status === 'submitted' && (
            <MessageBubble
              status={status}
              message={{ id: 'loading', role: 'assistant', content: '' }}
              isStreamingMessage={true}
            />
          )}
        </div>
        <div className="absolute bottom-4 right-4 z-10">
          <ScrollToBottomButton show={isScrolledUp} onClick={() => scrollToBottom()} />
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="flex select-none touch-none mr-1 p-0.5 bg-ui-bg-subtle duration-150 ease-out hover:bg-ui-bg-base data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5 transition-all"
      >
        <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-ui-border-base hover:bg-ui-border-hover" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
};
