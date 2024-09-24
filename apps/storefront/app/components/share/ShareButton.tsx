import { type FC } from 'react';
import { ButtonBase, ButtonBaseProps } from '@components/buttons/ButtonBase';
import { useSendEvent } from '../../../libs/util/analytics/useAnalytics';

export interface ShareButtonProps {
  shareData: ShareData;
  onSuccess?: () => void;
  onError?: (error?: unknown) => void;
  onNonNativeShare?: () => void;
  onInteraction?: () => void;
  disabled?: boolean;
  ButtonComponent?: FC<ButtonBaseProps>;
}

export const ShareButton: FC<ShareButtonProps> = ({
  shareData,
  onInteraction,
  onSuccess,
  onError,
  onNonNativeShare,
  disabled,
  ButtonComponent = ButtonBase,
}) => {
  const useSendNativeShareEvent = useSendEvent('share');

  const handleClick = async () => {
    onInteraction?.();

    if (navigator.share) {
      shareData.url =
        shareData.url || `${window.location.origin}${window.location.pathname}`;
      try {
        await navigator.share(shareData);
        useSendNativeShareEvent({ method: 'native', ...shareData });
        onSuccess && onSuccess();
      } catch (err) {
        onError && onError(err);
      }
    } else {
      onNonNativeShare?.();
    }
  };

  return (
    <ButtonComponent onClick={handleClick} type="button" disabled={disabled} />
  );
};
