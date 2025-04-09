import { ChatBubbleLeftRight } from '@medusajs/icons';
import { Button, Tooltip } from '@medusajs/ui';
import { ReactElement, cloneElement } from 'react';

interface TriggerButtonProps {
  onClick: () => void;
  tooltipContent?: string;
  triggerComponent?: ReactElement;
}

const BaseButton = ({ onClick }: Pick<TriggerButtonProps, 'onClick'>) => (
  <Button
    variant="primary"
    size="base"
    className="!h-10 !w-10 !rounded-full !p-0"
    aria-label="Open chat"
    onClick={onClick}
  >
    <ChatBubbleLeftRight />
  </Button>
);

export const TriggerButton = ({ onClick, tooltipContent = 'Open AI Chat', triggerComponent }: TriggerButtonProps) => {
  const button = <BaseButton onClick={onClick} />;

  const wrappedButton = triggerComponent ? cloneElement(triggerComponent, { asChild: true, children: button }) : button;

  return (
    <Tooltip content={tooltipContent}>
      <div className="fixed bottom-4 right-4">{wrappedButton}</div>
    </Tooltip>
  );
};
