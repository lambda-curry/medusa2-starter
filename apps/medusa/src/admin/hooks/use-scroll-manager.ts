import { RefObject, useCallback, useEffect, useState, useRef } from 'react';
import { debounce } from 'lodash';

type MessageStatus = 'idle' | 'streaming' | 'submitted' | 'error';

interface ScrollState {
  isScrolledUp: boolean;
  scrollToBottom: (smooth?: boolean) => void;
  shouldAutoScroll: boolean;
}

export const useScrollManager = (
  viewportRef: RefObject<HTMLElement>,
  status: MessageStatus = 'idle',
  threshold = 600,
): ScrollState => {
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastHeightRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const userScrolledRef = useRef(false);

  const checkScrollPosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const scrolledUp = distanceFromBottom > threshold;

    setIsScrolledUp(scrolledUp);

    // Track if user has manually scrolled up
    if (scrolledUp) {
      userScrolledRef.current = true;
      setShouldAutoScroll(false);
    } else {
      // User has scrolled back to bottom
      userScrolledRef.current = false;
      setShouldAutoScroll(true);
    }
  }, [viewportRef, threshold]);

  const scrollToBottom = useCallback(
    (smooth = true) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });

      setIsScrolledUp(false);
      setShouldAutoScroll(true);
      userScrolledRef.current = false;

      // Update last height after scrolling
      lastHeightRef.current = viewport.scrollHeight;
    },
    [viewportRef],
  );

  // Reset auto-scroll when status changes to streaming or submitted
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      // Only reset auto-scroll if user hasn't manually scrolled up
      if (!userScrolledRef.current) {
        setShouldAutoScroll(true);
        // Initial scroll to bottom when streaming starts
        scrollToBottom(false);
      }
    }
  }, [status, scrollToBottom]);

  // Main effect for handling scrolling during streaming
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const debouncedCheck = debounce(checkScrollPosition, 10, {
      trailing: true,
    });

    // Function to check for content height changes and scroll if needed
    const checkHeightAndScroll = () => {
      if (!viewport) return;

      // If we're streaming and should auto-scroll
      if ((status === 'streaming' || status === 'submitted') && shouldAutoScroll && !userScrolledRef.current) {
        const currentHeight = viewport.scrollHeight;

        // If content height has increased, scroll to bottom
        if (currentHeight > lastHeightRef.current) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'auto', // Using auto for continuous updates to avoid jarring experience
          });
          lastHeightRef.current = currentHeight;
        }
      }

      // Continue checking while streaming
      if (status === 'streaming') {
        rafRef.current = requestAnimationFrame(checkHeightAndScroll);
      }
    };

    // Start checking when streaming begins
    if (status === 'streaming') {
      lastHeightRef.current = viewport.scrollHeight;
      rafRef.current = requestAnimationFrame(checkHeightAndScroll);
    }

    viewport.addEventListener('scroll', debouncedCheck, { passive: true });
    window.addEventListener('resize', debouncedCheck, { passive: true });

    // Initial check
    checkScrollPosition();

    return () => {
      viewport.removeEventListener('scroll', debouncedCheck);
      window.removeEventListener('resize', debouncedCheck);
      debouncedCheck.cancel();

      // Cancel any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [viewportRef, checkScrollPosition, status, shouldAutoScroll]);

  return {
    isScrolledUp,
    scrollToBottom,
    shouldAutoScroll,
  };
};
