import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetVehicle, useUpdateVehicle, useDeleteVehicle } from '../gql/hooks/vehicleHooks';
import { useGetServiceRecords } from '../gql/hooks/serviceRecordHooks';
import InlineField from '../components/InlineField';
import { GhostButton, Button } from '@bka-stuff/pe-mfe-utils';
import AddServiceRecordModal from '../components/home/modals/AddServiceRecordModal';
import ServiceRecordRow from '../components/home/ServiceRecordRow';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vehicle, isPending, isError } = useGetVehicle(id!);
  const { data: records } = useGetServiceRecords(id);
  const sortedRecords = records ? [...records].sort((a, b) => b.date.localeCompare(a.date)) : [];

  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [showAddRecord, setShowAddRecord] = useState(false);
  const [confirmDeleteVehicle, setConfirmDeleteVehicle] = useState(false);

  if (isPending) return <div className="tw:p-6 tw:text-muted">Loading...</div>;
  if (isError || !vehicle) return <div className="tw:p-6 tw:text-red">Vehicle not found.</div>;

  const handleUpdate = (field: string, raw: string) => {
    const numericFields = ['year', 'mileage'];
    const value = numericFields.includes(field)
      ? raw
        ? Number(raw)
        : undefined
      : raw || undefined;
    updateVehicle.mutate({ id: vehicle.id, [field]: value });
  };

  const handleDeleteVehicle = () => {
    deleteVehicle.mutate(vehicle.id, { onSuccess: () => navigate('/') });
  };

  return (
    <div className="tw:max-w-3xl tw:mx-auto tw:px-4 tw:py-6">
      <button
        onClick={() => navigate('/home-maintenance')}
        className="tw:text-sm tw:text-muted tw:hover:text-primary tw:mb-4 tw:flex tw:items-center tw:gap-1"
      >
        ← Back
      </button>

      <div className="tw:bg-[#1a0f2e] tw:rounded-lg tw:border tw:border-purpleBorder tw:p-5 tw:mb-6">
        <div className="tw:flex tw:items-start tw:justify-between tw:mb-3">
          <h1 className="tw:text-xl tw:font-bold tw:text-primary">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          {confirmDeleteVehicle ? (
            <div className="tw:flex tw:items-center tw:gap-2">
              <span className="tw:text-xs tw:text-muted">Delete vehicle?</span>
              <button
                onClick={handleDeleteVehicle}
                className="tw:text-xs tw:text-red tw:hover:text-white tw:font-medium"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDeleteVehicle(false)}
                className="tw:text-xs tw:text-muted"
              >
                No
              </button>
            </div>
          ) : (
            <GhostButton
              last
              color="red"
              text="Delete"
              onClick={() => setConfirmDeleteVehicle(true)}
            />
          )}
        </div>

        <div className="tw:grid tw:grid-cols-2 tw:gap-x-6">
          <div>
            <InlineField
              label="Year"
              value={vehicle.year}
              type="number"
              onSave={(v) => handleUpdate('year', v)}
            />
            <InlineField
              label="Make"
              value={vehicle.make}
              onSave={(v) => handleUpdate('make', v)}
            />
            <InlineField
              label="Model"
              value={vehicle.model}
              onSave={(v) => handleUpdate('model', v)}
            />
            <InlineField
              label="Mileage"
              value={vehicle.mileage}
              type="number"
              onSave={(v) => handleUpdate('mileage', v)}
            />
            <InlineField
              label="Color"
              value={vehicle.color}
              onSave={(v) => handleUpdate('color', v)}
              placeholder="Not set"
            />
          </div>
          <div>
            <InlineField
              label="Trim"
              value={vehicle.trim}
              onSave={(v) => handleUpdate('trim', v)}
              placeholder="Not set"
            />
            <InlineField
              label="Plate"
              value={vehicle.plate}
              onSave={(v) => handleUpdate('plate', v)}
              placeholder="Not set"
            />
            <InlineField
              label="VIN"
              value={vehicle.vin}
              onSave={(v) => handleUpdate('vin', v)}
              placeholder="Not set"
            />
            <InlineField
              label="Insurance ID"
              value={vehicle.insuranceId}
              onSave={(v) => handleUpdate('insuranceId', v)}
              placeholder="Not set"
            />
          </div>
        </div>
      </div>

      <div className="tw:bg-[#1a0f2e] tw:rounded-lg tw:border tw:border-purpleBorder">
        <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:border-b tw:border-purpleBorder">
          <h2 className="tw:font-semibold tw:text-primary">Service Records</h2>
          <Button last text="+ Add record" color="purple" onClick={() => setShowAddRecord(true)} />
        </div>

        {sortedRecords.length === 0 && (
          <p className="tw:px-5 tw:py-4 tw:text-muted tw:text-sm">No service records yet.</p>
        )}

        {sortedRecords.map((record) => (
          <ServiceRecordRow key={record.id} record={record} vehicleId={vehicle.id} />
        ))}
      </div>

      <AddServiceRecordModal
        isOpen={showAddRecord}
        onClose={() => setShowAddRecord(false)}
        vehicleId={vehicle.id}
        currentMileage={vehicle.mileage}
      />
    </div>
  );
}
