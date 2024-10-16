import { useState, useEffect, useRef, useMemo } from 'react';
import debounce from 'lodash/debounce';

const updateArrowsVisibility = ({
  scrollableDiv,
  buffer,
}: {
  scrollableDiv: HTMLDivElement | null;
  buffer: number;
}) => {
  if (!scrollableDiv) return { showStartArrow: false, showEndArrow: true };

  const isHorizontal = scrollableDiv.scrollWidth > scrollableDiv.clientWidth;
  const scrollPos = isHorizontal ? scrollableDiv.scrollLeft : scrollableDiv.scrollTop;
  const scrollSize = isHorizontal ? scrollableDiv.scrollWidth : scrollableDiv.scrollHeight;
  const clientSize = isHorizontal ? scrollableDiv.clientWidth : scrollableDiv.clientHeight;

  const showStartArrow = scrollPos > buffer;
  const showEndArrow = scrollPos < scrollSize - clientSize - buffer;

  return { showStartArrow, showEndArrow };
};

export const useScrollArrows = ({
  buffer = 5,
  resetOnDepChange = [],
}: {
  buffer?: number;
  resetOnDepChange?: any[];
}) => {
  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const initialArrowsVisibility = useMemo(
    () =>
      updateArrowsVisibility({
        scrollableDiv: scrollableDivRef.current,
        buffer,
      }),
    [scrollableDivRef.current, buffer],
  );

  const [showStartArrow, setShowStartArrow] = useState(initialArrowsVisibility.showStartArrow);
  const [showEndArrow, setShowEndArrow] = useState(initialArrowsVisibility.showEndArrow);

  useEffect(() => {
    const handleScroll = debounce(() => {
      const { showStartArrow, showEndArrow } = updateArrowsVisibility({
        scrollableDiv: scrollableDivRef.current,
        buffer,
      });
      setShowStartArrow(showStartArrow);
      setShowEndArrow(showEndArrow);
    }, 100);

    const handleResize = debounce(() => {
      const { showStartArrow, showEndArrow } = updateArrowsVisibility({
        scrollableDiv: scrollableDivRef.current,
        buffer,
      });
      setShowStartArrow(showStartArrow);
      setShowEndArrow(showEndArrow);
    }, 100);

    if (scrollableDivRef.current) {
      scrollableDivRef.current.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (scrollableDivRef.current) {
        scrollableDivRef.current.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        handleScroll.cancel(); // Cancel any pending debounced function
        handleResize.cancel(); // Cancel any pending debounced function
      }
    };
  }, []);

  // reset scroll position and arrows when deps change
  useEffect(() => {
    if (!scrollableDivRef.current) return;

    scrollableDivRef.current.scrollTo(0, 0);

    const { showStartArrow, showEndArrow } = updateArrowsVisibility({
      scrollableDiv: scrollableDivRef.current,
      buffer,
    });
    setShowStartArrow(showStartArrow);
    setShowEndArrow(showEndArrow);
  }, resetOnDepChange);

  const handleArrowClick = (arrowDirection: 'start' | 'end') => {
    if (!scrollableDivRef.current) return;

    const isHorizontal = scrollableDivRef.current.scrollWidth > scrollableDivRef.current.clientWidth;
    const visibleSize = isHorizontal ? scrollableDivRef.current.clientWidth : scrollableDivRef.current.clientHeight;

    const scrollAmount = arrowDirection === 'end' ? visibleSize : -visibleSize;
    const scrollToOptions: ScrollToOptions = { behavior: 'smooth' };

    if (isHorizontal) {
      scrollToOptions['left'] = scrollAmount;
    } else {
      scrollToOptions['top'] = scrollAmount;
    }

    scrollableDivRef.current.scrollBy(scrollToOptions);
  };

  return { scrollableDivRef, showStartArrow, showEndArrow, handleArrowClick };
};
