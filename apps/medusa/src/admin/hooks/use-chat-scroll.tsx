import { RefObject, useEffect } from 'react';
import { useScrollManager } from './use-scroll-manager';
import { ChatStatus } from '../routes/ai-chat/components/ai-chat';

interface UseChatScrollOptions {
  /**
   * The viewport reference for the scrollable container
   */
  viewportRef: RefObject<HTMLDivElement>;

  /**
   * The chat ID, used to reset scrolling when chat changes
   */
  chatId?: string;

  /**
   * The current status of the chat
   */
  status?: ChatStatus;

  /**
   * The number of messages, used to detect when new messages are added
   */
  messagesCount: number;

  /**
   * Interval in ms for scrolling during streaming (default: 200)
   */
  streamingScrollInterval?: number;
}

/**
 * Custom hook to manage chat scrolling behavior
 * Handles initial scroll, new messages, and streaming updates
 */
export const useChatScroll = ({
  viewportRef,
  chatId,
  status,
  messagesCount,
  streamingScrollInterval = 200,
}: UseChatScrollOptions) => {
  // Get scroll utilities from the scroll manager
  const { isScrolledUp, scrollToBottom, shouldAutoScroll } = useScrollManager(viewportRef);

  // Initial load scrolling
  useEffect(() => {
    if (!chatId) return;
    const timer = requestAnimationFrame(() => scrollToBottom(false));
    return () => cancelAnimationFrame(timer);
  }, [chatId, scrollToBottom]);

  // Handle new messages
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messagesCount, shouldAutoScroll, scrollToBottom]);

  // Handle streaming updates with optimized frequency
  useEffect(() => {
    if (status !== 'streaming' || !shouldAutoScroll) return;

    // Use the configurable interval to control performance impact
    const scrollInterval = setInterval(() => {
      scrollToBottom();
    }, streamingScrollInterval);

    return () => clearInterval(scrollInterval);
  }, [status, shouldAutoScroll, scrollToBottom, streamingScrollInterval]);

  return {
    isScrolledUp,
    scrollToBottom,
    shouldAutoScroll,
  };
};
