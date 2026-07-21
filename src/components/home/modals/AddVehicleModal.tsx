import { FC, FormEvent, useState } from 'react';
import { Input, InputGroup, ModalButtons, Modal, ModalContent } from '@bka-stuff/pe-mfe-utils';
import { useCreateVehicle } from '../../../gql/hooks/vehicleHooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const AddVehicleModal: FC<Props> = ({ isOpen, onClose }) => {
  const { mutate: createVehicle, isPending } = useCreateVehicle();

  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [color, setColor] = useState('');
  const [trim, setTrim] = useState('');
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [insuranceId, setInsuranceId] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(`DERP`);
    createVehicle(
      {
        year: Number(year),
        make,
        model,
        mileage: Number(mileage),
        color: color || undefined,
        trim: trim || undefined,
        plate: plate || undefined,
        vin: vin || undefined,
        insuranceId: insuranceId || undefined,
      },
      {
        onSuccess() {
          onClose();
        },
      },
    );
  };

  const canSubmit = !!year && !!make && !!model && (!!mileage || mileage === '0');

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <ModalContent heading="New Vehicle">
        <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
          <div className="tw:grid tw:grid-cols-3 tw:gap-3">
            <InputGroup label="Year *">
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                placeholder="2020"
              />
            </InputGroup>

            <InputGroup label="Make *">
              <Input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                required
                placeholder="Toyota"
              />
            </InputGroup>

            <InputGroup label="Model *">
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                placeholder="Camry"
              />
            </InputGroup>
          </div>

          <div className="tw:grid tw:grid-cols-2 tw:gap-3">
            <InputGroup label="Mileage *">
              <Input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                required
                placeholder="50000"
              />
            </InputGroup>

            <InputGroup label="Color">
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
                placeholder="Black"
              />
            </InputGroup>
          </div>

          <div className="tw:grid tw:grid-cols-3 tw:gap-3">
            <InputGroup label="Trim">
              <Input value={trim} onChange={(e) => setTrim(e.target.value)} />
            </InputGroup>

            <InputGroup label="Plate">
              <Input value={plate} onChange={(e) => setPlate(e.target.value)} />
            </InputGroup>

            <InputGroup label="VIN">
              <Input value={vin} onChange={(e) => setVin(e.target.value)} />
            </InputGroup>
          </div>

          <InputGroup label="Insurance ID">
            <Input value={insuranceId} onChange={(e) => setInsuranceId(e.target.value)} />
          </InputGroup>

          <ModalButtons
            onClose={onClose}
            confirmText={isPending ? 'Saving...' : 'Add Vehicle'}
            isDisabled={isPending || !canSubmit}
          />
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddVehicleModal;
