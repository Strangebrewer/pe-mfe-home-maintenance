import { Modal, Button, GhostButton, TransparentButton } from '@bka-stuff/pe-mfe-utils';
import { FC } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name?: string;
}

const DeleteConfirmationModal: FC<Props> = ({ isOpen, onClose, onConfirm, name }) => {
  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <div className="tw:py-[32px] tw:px-[48px] tw:w-[440px]">
        <p className="tw:mb-[8px] tw:text-center">Are you sure you want to delete</p>
        <p className="tw:mb-[24px] tw:text-center tw:text-blue">{name}<span className='tw:text-primary'>&nbsp;?</span></p>
        <div className="tw:flex tw:justify-center tw:gap-2 tw:pt-1">
          <GhostButton color="grey" text="Cancel" onClick={onClose} />
          <Button
            color="red"
            text="Delete"
            onClick={handleConfirm}
            last
          />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
