import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetVehicle, useUpdateVehicle, useDeleteVehicle } from '../gql/hooks/vehicleHooks';
import {
  useGetServiceRecords,
  useCreateServiceRecord,
  useUpdateServiceRecord,
  useDeleteServiceRecord,
} from '../gql/hooks/serviceRecordHooks';
import { ServiceRecord, ServiceRecordType } from '../types/homeMaintenance';
import { formatDate, todayISO } from '../utils/taskUtils';
import InlineField from '../components/InlineField';
import Modal from '../components/Modal';
import { GhostButton, Button } from '@bka-stuff/pe-mfe-utils';

const SERVICE_RECORD_LABELS: Record<ServiceRecordType, string> = {
  [ServiceRecordType.OIL_CHANGE]: 'Oil Change',
  [ServiceRecordType.TIRE_ROTATION]: 'Tire Rotation',
  [ServiceRecordType.SERVICE_ITEM]: 'Service Item',
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vehicle, isPending, isError } = useGetVehicle(id!);
  const { data: records } = useGetServiceRecords(id);
  const sortedRecords = records ? [...records].sort((a, b) => b.date.localeCompare(a.date)) : [];

  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const createRecord = useCreateServiceRecord();
  const updateRecord = useUpdateServiceRecord();
  const deleteRecord = useDeleteServiceRecord(id!);

  const [showAddRecord, setShowAddRecord] = useState(false);
  const [confirmDeleteVehicle, setConfirmDeleteVehicle] = useState(false);
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState<string | null>(null);

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

      {/* Vehicle info */}
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

      {/* Service Records */}
      <div className="tw:bg-[#1a0f2e] tw:rounded-lg tw:border tw:border-purpleBorder">
        <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:border-b tw:border-purpleBorder">
          <h2 className="tw:font-semibold tw:text-primary">Service Records</h2>
          <Button last text="+ Add record" color="purple" onClick={() => setShowAddRecord(true)} />
        </div>

        {sortedRecords.length === 0 && (
          <p className="tw:px-5 tw:py-4 tw:text-muted tw:text-sm">No service records yet.</p>
        )}

        {sortedRecords.map((record) => (
          <div
            key={record.id}
            className="tw:px-5 tw:py-4 tw:border-b tw:border-purpleFaint tw:last:border-b-0"
          >
            <div className="tw:flex tw:items-start tw:justify-between tw:gap-3">
              <div className="tw:flex-1 tw:min-w-0">
                <div className="tw:flex tw:items-center tw:gap-2 tw:mb-2">
                  <span className="tw:text-sm tw:font-medium tw:text-primary">
                    {record.name || SERVICE_RECORD_LABELS[record.type]}
                  </span>
                  <span className="tw:text-xs tw:bg-[#1a0f2ecc] tw:text-muted tw:rounded tw:px-1.5 tw:py-0.5">
                    {SERVICE_RECORD_LABELS[record.type]}
                  </span>
                </div>
                <InlineField
                  label="Date"
                  value={record.date}
                  onSave={(v) =>
                    updateRecord.mutate({ id: record.id, vehicleId: vehicle.id, date: v })
                  }
                />
                <InlineField
                  label="Mileage"
                  value={record.mileage}
                  type="number"
                  onSave={(v) =>
                    updateRecord.mutate({
                      id: record.id,
                      vehicleId: vehicle.id,
                      mileage: Number(v),
                    })
                  }
                />
                <InlineField
                  label="Cost"
                  value={record.cost}
                  type="number"
                  onSave={(v) =>
                    updateRecord.mutate({
                      id: record.id,
                      vehicleId: vehicle.id,
                      cost: v ? Number(v) : undefined,
                    })
                  }
                  placeholder="Not set"
                />
                <InlineField
                  label="Name"
                  value={record.name}
                  onSave={(v) =>
                    updateRecord.mutate({
                      id: record.id,
                      vehicleId: vehicle.id,
                      name: v || undefined,
                    })
                  }
                  placeholder="None"
                />
                <InlineField
                  label="Description"
                  value={record.description}
                  onSave={(v) =>
                    updateRecord.mutate({
                      id: record.id,
                      vehicleId: vehicle.id,
                      description: v || undefined,
                    })
                  }
                  placeholder="None"
                />
              </div>
              <div className="tw:flex tw:flex-col tw:items-end tw:gap-2 tw:shrink-0">
                <span className="tw:text-xs tw:text-muted">{formatDate(record.date)}</span>
                {confirmDeleteRecord === record.id ? (
                  <div className="tw:flex tw:items-center tw:gap-1">
                    <button
                      onClick={() =>
                        deleteRecord.mutate(record.id, {
                          onSuccess: () => setConfirmDeleteRecord(null),
                        })
                      }
                      className="tw:text-xs tw:text-red tw:font-medium"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDeleteRecord(null)}
                      className="tw:text-xs tw:text-muted"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteRecord(record.id)}
                    className="tw:text-xs tw:text-red tw:hover:text-white"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddRecord && (
        <AddServiceRecordModal
          vehicleId={vehicle.id}
          currentMileage={vehicle.mileage}
          onClose={() => setShowAddRecord(false)}
          onSave={(data) => createRecord.mutate(data, { onSuccess: () => setShowAddRecord(false) })}
          isPending={createRecord.isPending}
        />
      )}
    </div>
  );
}

function AddServiceRecordModal({
  vehicleId,
  currentMileage,
  onClose,
  onSave,
  isPending,
}: {
  vehicleId: string;
  currentMileage: number;
  onClose: () => void;
  onSave: (data: {
    vehicleId: string;
    type: ServiceRecordType;
    date: string;
    mileage: number;
    cost?: number;
    name?: string;
    description?: string;
  }) => void;
  isPending: boolean;
}) {
  const [type, setType] = useState<ServiceRecordType>(ServiceRecordType.OIL_CHANGE);
  const [date, setDate] = useState(todayISO());
  const [mileage, setMileage] = useState(currentMileage.toString());
  const [cost, setCost] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      vehicleId,
      type,
      date,
      mileage: Number(mileage),
      cost: cost ? Number(cost) : undefined,
      name: name || undefined,
      description: description || undefined,
    });
  };

  const inputCls =
    'tw:w-full tw:border tw:border-purple tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:bg-bg tw:text-primary tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-purple';

  return (
    <Modal title="Add Service Record" onClose={onClose}>
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-muted tw:mb-1">Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ServiceRecordType)}
            className={inputCls}
          >
            {Object.values(ServiceRecordType).map((t) => (
              <option key={t} value={t}>
                {SERVICE_RECORD_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="tw:grid tw:grid-cols-2 tw:gap-3">
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-muted tw:mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-muted tw:mb-1">
              Mileage *
            </label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              required
              className={inputCls}
            />
          </div>
        </div>
        <div className="tw:grid tw:grid-cols-2 tw:gap-3">
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-muted tw:mb-1">Cost</label>
            <input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className={inputCls}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-muted tw:mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="e.g. Air filter"
            />
          </div>
        </div>
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-muted tw:mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputCls}
          />
        </div>
        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-1">
          <button
            type="button"
            onClick={onClose}
            className="tw:text-sm tw:text-muted tw:hover:text-primary tw:px-4 tw:py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="tw:text-sm tw:border tw:border-purple tw:text-purple tw:hover:bg-purple tw:hover:text-white tw:disabled:opacity-50 tw:rounded tw:px-4 tw:py-2"
          >
            {isPending ? 'Saving...' : 'Add Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
