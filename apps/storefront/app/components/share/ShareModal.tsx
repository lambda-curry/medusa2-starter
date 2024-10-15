import { type FC, useState } from 'react';
import { Modal, type ModalProps } from '@app/components/common/modals/Modal';
import { Input } from '@app/components/common/forms/inputs/Input';
import { Button } from '@app/components/common/buttons/Button';
import LinkIcon from '@heroicons/react/24/outline/LinkIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import { FacebookIcon, TwitterIcon } from '@app/components/common/assets/icons';
import { isBrowser } from '@libs/util/is-browser';
import { type ShareItemType } from './Share.types';

type ShareState = 'pending' | 'success' | 'error';

export interface ShareModalProps extends ModalProps {
  itemType?: ShareItemType;
  shareData: ShareData;
  onClose: () => void;
  onError?: (error?: unknown) => void;
}

export const ShareModal: FC<ShareModalProps> = ({ itemType, shareData, onError, ...props }) => {
  const [state, setState] = useState<ShareState>('pending');

  if (!isBrowser) return null;

  shareData.url = shareData.url || `${window.location.origin}${window.location.pathname}`;

  const getCopyButtonText = (state: ShareState) => {
    switch (state) {
      case 'success':
        return (
          <>
            <CheckIcon className="h-5 w-5" />
            <span className="hidden sm:block">Copied</span>
          </>
        );
      case 'pending':
      default:
        return (
          <>
            <LinkIcon className="h-5 w-5" />
            <span className="hidden sm:block">Copy link</span>
          </>
        );
    }
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url || '');
      setState('success');
      setTimeout(() => setState('pending'), 1000);
    } catch (err) {
      onError?.(err);
      setState('error');
    }
  };

  const handleFacebookClick = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url || '')}`,
      'facebook-share-dialog',
      'width=626,height=436',
    );
  };

  const handleTwitterClick = () => {
    window.open(
      `http://twitter.com/share?url=${encodeURIComponent(
        shareData.url || '',
      )}&text=${encodeURIComponent(shareData.title || '')}${
        shareData.text ? encodeURIComponent(` | ${shareData.text}`) : ''
      }`,
      'facebook-share-dialog',
      'width=626,height=436',
    );
  };

  return (
    <Modal {...props}>
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900">
          Share this {itemType ? itemType.toLocaleLowerCase() : 'page'}
        </h3>

        {state === 'error' && (
          <div>
            <p>Unable to copy to clipboard, please manually copy the url to share.</p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="flex gap-2 sm:gap-4">
            <Button className="flex-1" onClick={handleFacebookClick}>
              <FacebookIcon className="h-5 w-5" />
              <span className="hidden sm:block">Facebook</span>
            </Button>

            <Button className="flex-1" onClick={handleTwitterClick}>
              <TwitterIcon className="h-5 w-5" />
              <span className="hidden sm:block">Twitter</span>
            </Button>

            <Button className="flex-1" onClick={() => void handleCopyClick()}>
              {getCopyButtonText(state)}
            </Button>
          </div>

          <Input value={shareData.url || ''} readOnly />
        </div>
      </div>
    </Modal>
  );
};
