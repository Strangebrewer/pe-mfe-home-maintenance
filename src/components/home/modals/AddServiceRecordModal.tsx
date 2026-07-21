import {
  Input,
  InputGroup,
  Modal,
  ModalButtons,
  ModalContent,
  Select,
  Textarea,
} from '@bka-stuff/pe-mfe-utils';
import { FC, useState } from 'react';
import { ServiceRecordType } from '../../../types/homeMaintenance';
import { SERVICE_RECORD_LABELS, todayISO } from '../../../utils/taskUtils';
import { useCreateServiceRecord } from '../../../gql/hooks/serviceRecordHooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  currentMileage: number;
};

const AddServiceRecordModal: FC<Props> = ({ isOpen, onClose, currentMileage, vehicleId }) => {
  const [type, setType] = useState<ServiceRecordType>(ServiceRecordType.OIL_CHANGE);
  const [date, setDate] = useState(todayISO());
  const [mileage, setMileage] = useState(currentMileage.toString());
  const [cost, setCost] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { mutate: createRecord, isPending } = useCreateServiceRecord();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRecord(
      {
        vehicleId,
        type,
        date,
        mileage: Number(mileage),
        cost: cost ? Number(cost) : undefined,
        name: name || undefined,
        description: description || undefined,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  const canSubmit = !!type && !!date && !!mileage;

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <ModalContent heading="Add Service Record">
        <form onSubmit={handleSubmit}>
          <InputGroup label="Type *">
            <Select value={type} onChange={(e) => setType(e.target.value as ServiceRecordType)}>
              {Object.values(ServiceRecordType).map((t) => (
                <option key={t} value={t}>
                  {SERVICE_RECORD_LABELS[t]}
                </option>
              ))}
            </Select>
          </InputGroup>

          <div className="tw:grid tw:grid-cols-2 tw:gap-3 tw:mt-2">
            <InputGroup label="Date *">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </InputGroup>

            <InputGroup label="Mileage *">
              <Input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                required
              />
            </InputGroup>
          </div>

          <div className="tw:grid tw:grid-cols-2 tw:gap-3 tw:my-2">
            <InputGroup label="Cost">
              <Input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </InputGroup>

            <InputGroup label="Name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Air filter"
              />
            </InputGroup>
          </div>

          <InputGroup label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              full
            />
          </InputGroup>

          <ModalButtons
            onClose={onClose}
            confirmText={isPending ? 'Saving...' : 'Add Record'}
            isDisabled={isPending || !canSubmit}
          />
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddServiceRecordModal;
