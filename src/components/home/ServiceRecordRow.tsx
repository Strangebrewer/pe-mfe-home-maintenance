import { FC, useState } from 'react';
import { ActionButton, GhostButton, DeleteConfirmationModal } from '@bka-stuff/pe-mfe-utils';
import { ServiceRecord } from '../../types/homeMaintenance';
import { formatDate, SERVICE_RECORD_LABELS } from '../../utils/taskUtils';
import InlineField from '../InlineField';
import { useDeleteServiceRecord, useUpdateServiceRecord } from '../../gql/hooks/serviceRecordHooks';

type Props = {
  vehicleId: string;
  record: ServiceRecord;
};

type ServiceRecordUpdateFields = {
  date?: string;
  mileage?: number;
  cost?: number;
  name?: string;
  description?: string;
};

const ServiceRecordRow: FC<Props> = ({ vehicleId, record }) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: updateRecord } = useUpdateServiceRecord();
  const { mutate: deleteRecord } = useDeleteServiceRecord(vehicleId);

  function onUpdate(data: ServiceRecordUpdateFields) {
    updateRecord({
      id: record.id,
      vehicleId,
      ...data,
    });
  }

  function onDelete() {
    deleteRecord(record.id, { onSuccess: () => setConfirmDelete(false) });
  }

  return (
    <div className="tw:border-b tw:border-purpleFaint tw:last:border-b-0">
      <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-3">
        <ActionButton
          iconClass={expanded ? 'fas fa-caret-down' : 'fas fa-caret-right'}
          color="blue"
          onClick={() => setExpanded(!expanded)}
        />
        <span className="tw:flex-1 tw:min-w-0 tw:truncate tw:text-sm">
          {record.name || SERVICE_RECORD_LABELS[record.type]}
        </span>
        {record.name && (
          <span className="tw:text-xs tw:text-muted tw:shrink-0">
            {SERVICE_RECORD_LABELS[record.type]}
          </span>
        )}
        <span className="tw:text-xs tw:text-muted tw:shrink-0">{formatDate(record.date)}</span>
        <span className="tw:text-xs tw:text-muted tw:shrink-0">
          {record.mileage.toLocaleString()} mi
        </span>
      </div>

      {expanded && (
        <div className="tw:px-5 tw:pb-4 tw:pt-1 tw:border-t tw:border-purpleFaint">
          <InlineField label="Date" value={record.date} onSave={(v) => onUpdate({ date: v })} />
          <InlineField
            label="Mileage"
            value={record.mileage}
            type="number"
            onSave={(v) => onUpdate({ mileage: Number(v) })}
          />
          <InlineField
            label="Cost"
            value={record.cost}
            type="number"
            onSave={(v) => onUpdate({ cost: v ? Number(v) : undefined })}
            placeholder="Not set"
          />
          <InlineField
            label="Name"
            value={record.name}
            onSave={(v) => onUpdate({ name: v || undefined })}
            placeholder="None"
          />
          <InlineField
            label="Description"
            value={record.description}
            onSave={(v) => onUpdate({ description: v || undefined })}
            placeholder="None"
          />
          <div className="tw:flex tw:justify-end tw:pt-2">
            {confirmDelete ? (
              <div className="tw:flex tw:items-center tw:gap-2">
                <span className="tw:text-xs tw:text-muted">Delete record?</span>
                <button
                  onClick={onDelete}
                  className="tw:text-xs tw:text-red tw:font-medium tw:cursor-pointer"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="tw:text-xs tw:text-muted tw:cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <GhostButton
                text="Delete"
                color="red"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                last
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRecordRow;
