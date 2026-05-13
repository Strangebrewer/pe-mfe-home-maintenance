import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GhostButton, DeleteConfirmationModal } from '@bka-stuff/pe-mfe-utils';
import { Home } from '../../types/homeMaintenance';
import InlineField from '../InlineField';
import { useDeleteHome, useUpdateHome } from '../../gql/hooks/homeHooks';
import CustomDataModal from './modals/CustomDataModal';

type Props = {
  home: Home;
};

const HomeDetails: FC<Props> = ({ home }) => {
  const navigate = useNavigate();
  const [showCustomData, setShowCustomData] = useState(false);
  const [confirmDeleteHome, setConfirmDeleteHome] = useState(false);

  const { mutate: updateHome } = useUpdateHome();
  const { mutate: deleteHome } = useDeleteHome();

  const customData = home.customData ? (JSON.parse(home.customData) as Record<string, string>) : {};

  const handleUpdateHome = (field: string, raw: string) => {
    const numericFields = ['yearBuilt', 'sqFootage'];
    const value = numericFields.includes(field)
      ? raw
        ? Number(raw)
        : undefined
      : raw || undefined;
    updateHome({ id: home.id, [field]: value });
  };

  const handleDeleteHome = () => {
    deleteHome(home.id, { onSuccess: () => navigate('/home-maintenance') });
  };

  return (
    <div className="tw:bg-surface tw:rounded-lg tw:border tw:border-purpleBorder tw:p-5 tw:mb-6">
      <div className="tw:flex tw:items-start tw:justify-between tw:mb-3">
        <h1 className="tw:text-xl tw:font-bold tw:text-primary">{home.address}</h1>
        <div className="tw:flex">
          <GhostButton text="Custom data" color="purple" onClick={() => setShowCustomData(true)} />

          <GhostButton text="Delete" color="red" onClick={() => setConfirmDeleteHome(true)} last />
        </div>
      </div>

      <InlineField
        label="Address"
        value={home.address}
        onSave={(v) => handleUpdateHome('address', v)}
      />
      <InlineField
        label="Year built"
        value={home.yearBuilt}
        type="number"
        onSave={(v) => handleUpdateHome('yearBuilt', v)}
        placeholder="Not set"
      />
      <InlineField
        label="Sq footage"
        value={home.sqFootage}
        type="number"
        onSave={(v) => handleUpdateHome('sqFootage', v)}
        placeholder="Not set"
      />
      <InlineField
        label="Notes"
        value={home.notes}
        onSave={(v) => handleUpdateHome('notes', v)}
        placeholder="None"
      />

      {Object.keys(customData).length > 0 && (
        <div className="tw:mt-3 tw:pt-3 tw:border-t tw:border-purpleFaint">
          {Object.entries(customData).map(([key, val]) => (
            <div key={key} className="tw:flex tw:gap-3 tw:py-0.5">
              <span className="tw:text-sm tw:text-muted tw:w-28 tw:shrink-0">{key}</span>
              <span className="tw:text-sm tw:text-primary">{val}</span>
            </div>
          ))}
        </div>
      )}

      <CustomDataModal
        isOpen={showCustomData}
        onClose={() => setShowCustomData(false)}
        homeId={home.id}
        customData={home.customData ?? ''}
      />

      <DeleteConfirmationModal
        isOpen={confirmDeleteHome}
        onClose={() => setConfirmDeleteHome(false)}
        onConfirm={handleDeleteHome}
        name={home.address}
      />
    </div>
  );
};

export default HomeDetails;
