import { Message } from '../types';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ComponentPropsWithoutRef } from 'react';
import { memo } from 'react';
import { LoadingDots } from './loading-dots';
import { ChatStatus } from './ai-chat';
import { ToolResultDisplay } from './ToolResults/tool-result-display';
import { ReasoningDisplay } from './reasoning-display';

interface MessageBubbleProps {
  message: Message;
  status?: ChatStatus;
  isStreamingMessage?: boolean;
}

const partsIncludeToolsOrReasoning = (parts: Message['parts']): boolean => {
  return parts?.some((part) => part.type === 'tool-invocation' || part.type === 'reasoning') ?? false;
};

// Memo the message bubble component to prevent unnecessary re-renders
export const MessageBubble = memo(
  ({ message, status, isStreamingMessage }: MessageBubbleProps) => {
    const isUser = message.role === 'user';

    const markdownComponents: Components = {
      pre: (props: ComponentPropsWithoutRef<'pre'>) => (
        <pre {...props} className="bg-ui-bg-subtle p-4 rounded-lg overflow-auto max-w-full" />
      ),
      code: ({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => (
        <code
          {...props}
          className={`${className ?? ''} ${
            inline
              ? 'bg-ui-bg-subtle px-1 py-0.5 rounded'
              : 'block bg-ui-bg-subtle p-4 rounded-lg overflow-x-auto text-xs sm:text-sm'
          }`}
        >
          {children}
        </code>
      ),
      img: (props: ComponentPropsWithoutRef<'img'>) => <img {...props} className="max-w-full h-auto rounded-lg" />,
    };

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`w-full @sm/chat:max-w-[80%] rounded-lg p-4 ${
            isUser ? 'bg-ui-bg-highlight text-ui-fg-base' : 'bg-ui-bg-base border border-ui-border-base'
          } ${isStreamingMessage ? 'streaming-message' : ''}`}
        >
          {!isUser && message.parts && partsIncludeToolsOrReasoning(message.parts) && (
            <div className="mb-4 flex gap-2 flex-wrap">
              {message.parts.map((part, index) => {
                if (part.type === 'tool-invocation') {
                  return <ToolResultDisplay key={index} result={part} />;
                }
                if (part.type === 'reasoning') {
                  return <ReasoningDisplay key={index} part={part} />;
                }
                return null;
              })}
            </div>
          )}

          <ReactMarkdown
            className="max-w-full break-words markdown-content [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap sm:[&_pre]:whitespace-normal inline"
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>

          {(status === 'streaming' || status === 'submitted') && isStreamingMessage && !isUser && (
            <LoadingDots className="my-2 ml-1" />
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Only re-render if these props have changed
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.isStreamingMessage === nextProps.isStreamingMessage &&
      prevProps.status === nextProps.status
    );
  },
);
