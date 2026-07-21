import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ItemCard } from '@bka-stuff/pe-mfe-utils';
import AddVehicleModal from './modals/AddVehicleModal';
import { useGetVehicles } from '../../gql/hooks/vehicleHooks';

type Props = {};

const VehiclesList: FC<Props> = () => {
  const navigate = useNavigate();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const { data: vehicles, isPending: vehiclesPending, isError: vehiclesError } = useGetVehicles();

  return (
    <div>
      <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
        <h2 className="tw:text-xl tw:font-bold tw:text-primary">Vehicles</h2>
        <Button last text="+ Add vehicle" color="purple" onClick={() => setShowAddVehicle(true)} />
      </div>

      {vehiclesPending && <p className="tw:text-muted">Loading...</p>}
      {vehiclesError && <p className="tw:text-red">Failed to load vehicles.</p>}
      {vehicles?.length === 0 && <p className="tw:text-muted tw:text-sm">No vehicles yet.</p>}

      <div className="tw:grid tw:gap-3">
        {vehicles?.map((v) => (
          <ItemCard key={v.id} onClick={() => navigate(`/home-maintenance/vehicles/${v.id}`)}>
            <div className="tw:flex tw:items-center tw:justify-between">
              <span className="tw:font-medium tw:text-primary">
                {v.year} {v.make} {v.model}
              </span>
              <span className="tw:text-sm tw:text-muted">{v.mileage?.toLocaleString()} mi →</span>
            </div>
            {(v.color || v.trim) && (
              <span className="tw:text-sm tw:text-muted">
                {[v.color, v.trim].filter(Boolean).join(' · ')}
              </span>
            )}
          </ItemCard>
        ))}
      </div>

      <AddVehicleModal isOpen={showAddVehicle} onClose={() => setShowAddVehicle(false)} />
    </div>
  );
};

export default VehiclesList;
