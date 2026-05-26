import {
  Modal,
  Label,
  Input,
  Select,
  Button,
  GhostButton,
  Textarea,
} from '@bka-stuff/pe-mfe-utils';
import { FC, useState } from 'react';
import { HomeTaskFrequency } from '../../../types/homeMaintenance';
import { FREQUENCY_LABELS } from '../../../utils/taskUtils';
import { useCreateHomeTask } from '../../../gql/hooks/homeTaskHooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  homeId: string;
};

const AddTaskModal: FC<Props> = ({ isOpen, onClose, homeId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HomeTaskFrequency>(HomeTaskFrequency.ANNUAL);
  const { mutate: createTask, isPending } = useCreateHomeTask();

  function closeModal() {
    setName('');
    setDescription('');
    setFrequency(HomeTaskFrequency.ANNUAL);
    onClose();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask({ homeId, name, frequency, description }, { onSuccess: closeModal });
  };

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <form
        onSubmit={handleSubmit}
        className="tw:flex tw:flex-col tw:gap-4 tw:py-[32px] tw:px-[48px]"
      >
        <h1 className="tw:text-center tw:text-[24px]">Add Task</h1>
        <div>
          <Label text="Name *" />
          <Input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            full
          />
        </div>

        <div>
          <Label text="Frequency *" />
          <Select
            name="name"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HomeTaskFrequency)}
            full
          >
            {Object.values(HomeTaskFrequency).map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label text="Description" />
          <Textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            full
          />
        </div>

        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-1">
          <GhostButton text="Cancel" color="red" onClick={onClose} />
          <Button
            text={isPending ? 'Saving...' : 'Add Task'}
            color="green"
            onClick={handleSubmit}
            disabled={isPending}
            last
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;
