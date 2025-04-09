import { Button } from '@medusajs/ui';
import { ArrowDown } from '@medusajs/icons';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  show: boolean;
}

export const ScrollToBottomButton = ({ onClick, show }: ScrollToBottomButtonProps) => {
  if (!show) return null;

  return (
    <Button
      variant="secondary"
      size="small"
      className="fixed bottom-24 h-10 w-10 right-4 z-10 rounded-full shadow-lg"
      onClick={onClick}
      aria-label="Scroll to bottom"
    >
      <ArrowDown aria-hidden="true" className="w-4 h-4 scale-110" />
    </Button>
  );
};
