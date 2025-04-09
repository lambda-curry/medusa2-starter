import { useState, useEffect, RefObject } from 'react';

interface ScrollToBottomOptions {
  threshold?: number;
  containerRef: RefObject<HTMLElement>;
  messagesLength: number;
}

export const useScrollToBottom = ({ threshold = 100, containerRef, messagesLength }: ScrollToBottomOptions) => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const checkScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < threshold;
      setShowScrollButton(!isAtBottom);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      checkScroll();
    }

    return () => container?.removeEventListener('scroll', checkScroll);
  }, [containerRef, threshold]);

  // Auto scroll to bottom on new messages if already at bottom
  useEffect(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < threshold;

    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messagesLength, containerRef, threshold]);

  return { showScrollButton, scrollToBottom };
};
