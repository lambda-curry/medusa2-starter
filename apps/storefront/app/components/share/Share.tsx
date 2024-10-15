import { type FC, useState } from 'react';
import { ShareButton } from './ShareButton';
import { ShareModal } from './ShareModal';
import { type ButtonBaseProps, IconButton } from '@app/components/common/buttons';
import ArrowUpOnSquareIcon from '@heroicons/react/24/outline/ArrowUpOnSquareIcon';
import { ShareItemType } from './Share.types';

export interface ShareProps {
  itemType?: ShareItemType;
  shareData: ShareData;
  onSuccess?: () => void;
  onError?: (error?: unknown) => void;
  onInteraction?: () => void;
  disabled?: boolean;
  ButtonComponent?: FC<ButtonBaseProps>;
}

export const Share: FC<ShareProps> = ({
  itemType = 'page',
  shareData,
  onInteraction,
  onSuccess,
  onError,
  disabled,
  ButtonComponent = (buttonProps) => <IconButton icon={ArrowUpOnSquareIcon} {...buttonProps} />,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNonNativeShare = () => setIsModalOpen(true);

  return (
    <>
      <ShareButton
        shareData={shareData}
        onInteraction={onInteraction}
        onSuccess={onSuccess}
        onError={onError}
        onNonNativeShare={handleNonNativeShare}
        disabled={disabled}
        ButtonComponent={ButtonComponent}
      />
      <ShareModal
        itemType={itemType}
        isOpen={isModalOpen}
        shareData={shareData}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
