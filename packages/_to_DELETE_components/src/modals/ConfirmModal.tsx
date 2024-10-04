import { FC, ReactNode, useState } from 'react';
import { Modal, ModalProps } from './Modal';
import { Actions } from '../actions';
import { Button } from '../buttons';

export interface ConfirmModalProps extends ModalProps {
  title?: ReactNode;
  text?: ReactNode;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  title = 'Confirm',
  text = 'Are your sure? This cannot be undone.',
  confirmButtonLabel,
  cancelButtonLabel,
  onConfirm,
  onCancel,
  ...props
}) => {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm();
    setConfirming(false);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <Modal {...props}>
      {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
      {text && <div className="mt-4">{text}</div>}

      <Actions>
        <Button
          variant="primary"
          className="!flex-grow-0"
          onClick={handleConfirm}
          disabled={confirming}
          data-cy="confirm-modal-confirm-button"
        >
          {confirmButtonLabel || (confirming ? 'Confirming...' : 'Confirm')}
        </Button>
        <Button
          className="!flex-grow-0"
          onClick={handleCancel}
          disabled={confirming}
          data-cy="confirm-modal-cancel-button"
        >
          {cancelButtonLabel || 'Cancel'}
        </Button>
      </Actions>
    </Modal>
  );
};
