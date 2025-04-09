import { useChat } from '@ai-sdk/react';
import { useChatSession } from '../../../hooks/use-chat-session';
import { ChatMessages } from './chat-messages';
import { TooltipProvider, clx } from '@medusajs/ui';
import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { FormEvent, useCallback, useMemo, useEffect } from 'react';
import { Message } from 'ai';
import { TextUIPart, ReasoningUIPart, ToolInvocationUIPart, SourceUIPart } from '@ai-sdk/ui-utils';
import { abstractHtmlContent } from '../../../utils/abstract-html';
import { useToolResultHandlers } from './ToolResults/use-tool-handlers';
import { ToolPart } from '../types';
import { usePersistentInput } from '../../../hooks/use-persistent-input';
import { useQueryClient } from '@tanstack/react-query';
type UIMessage = Message & {
  parts: Array<TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart>;
};

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

interface AiChatProps {
  className?: string;
  showHeader?: boolean;
}

export const AiChat = ({ className, showHeader = false }: AiChatProps) => {
  const { chatId, initialMessages, startNewChat, handleChatResponse } = useChatSession();
  const { processToolResult, resetProcessedResults } = useToolResultHandlers();
  // const queryClient = useQueryClient();
  // console.log('>>>> queryClient', queryClient.getQueryCache().findAll());

  // HTML content processing
  const processHtmlContent = useCallback(() => {
    return abstractHtmlContent();
  }, []);

  // System message creation
  const createSystemMessage = useCallback((htmlContent: string): UIMessage => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const content = [
      `You are currently helping with the page at: ${currentUrl}`,
      '',
      "Below is the HTML content of the current page you're helping with. You can use this as reference when answering questions:",
      '',
      htmlContent,
    ].join('\n');

    return {
      id: `system_${Date.now()}`,
      role: 'system',
      content,
      parts: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  }, []);

  // Message preparation for API
  const prepareMessages = useCallback(
    (messages: Message[], htmlContent: string | null): UIMessage[] => {
      const lastMessage = messages.slice(-1).map((message) => ({
        ...message,
        parts: [
          {
            type: 'text',
            text: message.content.trim(),
          },
        ],
      })) as UIMessage[];

      if (!htmlContent) return lastMessage;

      return [createSystemMessage(htmlContent), ...lastMessage];
    },
    [createSystemMessage],
  );

  // Chat configuration and state
  const {
    messages,
    input: chatInput,
    setInput: setChatInput,
    handleSubmit: handleChatSubmit,
    status,
  } = useChat({
    id: chatId || undefined,
    initialMessages: initialMessages || [],
    api: '/chat',
    body: chatId ? { id: chatId } : undefined,
    experimental_prepareRequestBody: (options) => {
      const htmlContent = processHtmlContent();
      options.messages = prepareMessages(options.messages, htmlContent);
      return options;
    },
    onResponse: handleChatResponse,
  });

  // Determine if we should reset the input
  const shouldResetInput = status === 'submitted';

  // Use the persistent input hook to manage input state with localStorage
  const [input, setInput] = usePersistentInput(chatInput, setChatInput, shouldResetInput);

  const filteredMessages = useMemo(() => messages.filter((message) => message.role !== 'system'), [messages]);

  // Separate streaming message from static ones
  const streamingMessage = useMemo(() => {
    if (status !== 'streaming') return null;
    return filteredMessages[filteredMessages.length - 1];
  }, [filteredMessages, status]);

  const staticMessages = useMemo(() => {
    if (status !== 'streaming') return filteredMessages;
    return filteredMessages.slice(0, -1);
  }, [filteredMessages, status]);

  // Process tool results when a streaming message is available
  useEffect(() => {
    if (streamingMessage && streamingMessage.parts) {
      // Reset processed results when starting a new chat
      if (status === 'streaming' && streamingMessage.parts.length === 1) {
        resetProcessedResults();
      }

      // Process all tool parts in the streaming message
      streamingMessage.parts.forEach((part) => {
        if (part.type === 'tool-invocation') {
          processToolResult(part as unknown as ToolPart, streamingMessage, true);
        }
      });
    }
  }, [streamingMessage, status, processToolResult, resetProcessedResults]);

  // Reset processed results when starting a new chat
  useEffect(() => {
    if (!chatId) {
      resetProcessedResults();
    }
  }, [chatId, resetProcessedResults]);

  // Form submission handler
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>, value: string) => {
      // We're passing the input value directly to the original handler
      // But we need to set it first for the handleChatSubmit to work properly
      setInput(value);
      handleChatSubmit(e);
      // After submission, input will be cleared by the hook when status changes to 'submitted'
    },
    [handleChatSubmit, setInput],
  );

  // Loading state
  const isLoading = status === 'submitted' || status === 'streaming';

  // Render
  return (
    <TooltipProvider>
      <div className={clx('flex flex-col relative z-0', className)}>
        {showHeader && <ChatHeader onNewChat={startNewChat} />}
        <ChatMessages
          messages={staticMessages}
          streamingMessage={streamingMessage}
          chatId={chatId || undefined}
          status={status as ChatStatus}
          className={clx(showHeader ? 'h-[calc(100vh-184px)]' : 'h-[calc(100vh-140px)]')}
        />
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} input={input} setInput={setInput} />
      </div>
    </TooltipProvider>
  );
};
