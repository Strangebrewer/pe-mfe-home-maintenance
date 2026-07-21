import React, { FC, useState } from 'react';
import {
  Modal,
  Input,
  Textarea,
  ModalContent,
  InputGroup,
  ModalButtons,
} from '@bka-stuff/pe-mfe-utils';
import { todayISO } from '../../../utils/taskUtils';
import { useCreateHomeCompletion } from '../../../gql/hooks/homeCompletionHooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  logTask: Record<string, any> | null;
};
const LogCompletionModal: FC<Props> = ({ isOpen, onClose, logTask }) => {
  const [date, setDate] = useState(todayISO());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const { mutate: logTaskCompletion, isPending } = useCreateHomeCompletion();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const taskCompletion = {
      taskId: logTask?.id,
      cost: cost ? Number(cost) : undefined,
      date,
      notes,
    };
    logTaskCompletion(taskCompletion, { onSuccess: handleClose });
  }

  function handleClose() {
    setDate(todayISO());
    setCost('');
    setNotes('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} close={handleClose}>
      <ModalContent heading={`Log ${logTask?.name}`}>
        <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
          <InputGroup label="Date *">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              full
            />
          </InputGroup>

          <InputGroup label="Cost">
            <Input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              full
            />
          </InputGroup>

          <InputGroup label="Notes">
            <Textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} full />
          </InputGroup>

          <ModalButtons
            onClose={onClose}
            confirmText={isPending ? 'Saving...' : 'Save'}
            isDisabled={isPending || !date}
          />
        </form>
      </ModalContent>
    </Modal>
  );
};

export default LogCompletionModal;
