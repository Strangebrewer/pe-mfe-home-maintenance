import React, { FC, useState } from 'react';
import { Modal, Input, Label, Textarea, Button, GhostButton } from '@bka-stuff/pe-mfe-utils';
import { todayISO } from '../../../utils/taskUtils';
import { useCreateHomeCompletion } from '../../../gql/hooks/homeCompletionHooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  logTaskId: Record<string, any> | null;
};
const LogCompletionModalNew: FC<Props> = ({ isOpen, onClose, logTaskId }) => {
  const [date, setDate] = useState(todayISO());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const { mutate: logTaskCompletion, isPending } = useCreateHomeCompletion();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const taskCompletion = {
      id: logTaskId?.id,
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
      <form
        onSubmit={handleSubmit}
        className="tw:flex tw:flex-col tw:gap-4 tw:py-[32px] tw:px-[48px]"
      >
        <h1 className="tw:text-center tw:text-[24px]">Log {logTaskId?.name}</h1>
        <div>
          <Label text="Date *" />
          <Input
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            full
          />
        </div>
        <div>
          <Label text="Cost" />
          <Input
            name="date"
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            full
          />
        </div>
        <div>
          <Label text="Notes" />
          <Textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} full />
        </div>
        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-1">
          <GhostButton text="Cancel" color="red" onClick={handleClose} />
          <Button
            type="submit"
            text={isPending ? 'Saving...' : 'Save'}
            color="green"
            disabled={isPending}
            last
          />
        </div>
      </form>
    </Modal>
  );
};

export default LogCompletionModalNew;
