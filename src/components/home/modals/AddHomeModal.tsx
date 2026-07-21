import { FC, FormEvent, useState } from 'react';
import {
  Input,
  Textarea,
  InputGroup,
  ModalButtons,
  Modal,
  ModalContent,
} from '@bka-stuff/pe-mfe-utils';
import { useCreateHome } from '../../../gql/hooks/homeHooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const AddHomeModal: FC<Props> = ({ isOpen, onClose }) => {
  const { mutate: createHome, isPending } = useCreateHome();

  const [address, setAddress] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [sqFootage, setSqFootage] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createHome(
      {
        address,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
        sqFootage: sqFootage ? Number(sqFootage) : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess() {
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <ModalContent heading="New Home">
        <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
          <InputGroup label="Address *">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="123 Main St, City, ST"
            />
          </InputGroup>

          <div className="tw:grid tw:grid-cols-2 tw:gap-3">
            <InputGroup label="Year Built">
              <Input
                type="number"
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
                placeholder="1990"
              />
            </InputGroup>

            <InputGroup label="Sq Footage">
              <Input
                type="number"
                value={sqFootage}
                onChange={(e) => setSqFootage(e.target.value)}
                placeholder="2000"
              />
            </InputGroup>
          </div>

          <InputGroup label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </InputGroup>

          <ModalButtons
            onClose={onClose}
            confirmText={isPending ? 'Saving...' : 'Add Home'}
            isDisabled={isPending || !address}
          />
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddHomeModal;
