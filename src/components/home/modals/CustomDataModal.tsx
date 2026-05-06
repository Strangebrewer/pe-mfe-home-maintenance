import { Modal, Input, Button, GhostButton } from '@bka-stuff/pe-mfe-utils';
import { FC, useEffect, useState } from 'react';
import { useUpdateHome } from '../../../gql/hooks/homeHooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  homeId: string;
  customData: string;
};

const CustomDataModal: FC<Props> = ({ isOpen, onClose, homeId, customData }) => {
  const emptyRow = { key: '', value: '' };
  const [rows, setRows] = useState<{ key: string; value: string }[]>([emptyRow]);
  const { mutate: updateHome, isPending } = useUpdateHome();

  useEffect(() => {
    if (isOpen) {
      const parsed = customData ? (JSON.parse(customData) as Record<string, string>) : {};
      const existingEntries = Object.entries(parsed).map(([key, value]) => ({ key, value }));
      setRows([...existingEntries, emptyRow]);
    }
  }, [isOpen]);

  function addRow(e: any) {
    e.preventDefault();
    setRows((r: any) => [...r, { key: '', value: '' }])
  }
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: 'key' | 'value', val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = {};
    rows.filter((r) => r.key.trim()).forEach((r) => { data[r.key.trim()] = r.value; });
    updateHome({ id: homeId, customData: JSON.stringify(data) }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4 tw:py-[32px] tw:px-[48px]">
        <h1 className="tw:text-center tw:text-[24px]">Custom Data</h1>
        <div className="tw:flex tw:flex-col tw:gap-2">
          {rows.map((row, i) => (
            <div key={i} className="tw:flex tw:gap-2 tw:items-center">
              <div className="tw:flex-1">
                <Input type="text" name={`key-${i}`} value={row.key} onChange={(e) => updateRow(i, 'key', e.target.value)} full />
              </div>
              <div className="tw:flex-1">
                <Input type="text" name={`value-${i}`} value={row.value} onChange={(e) => updateRow(i, 'value', e.target.value)} full />
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="tw:text-[#e22c5a] tw:hover:text-white tw:text-lg tw:leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="tw:flex tw:justify-center tw:pt-2">
          <GhostButton text="+ Add field" color="blue" onClick={addRow} />
          <GhostButton text="Cancel" color="red" onClick={onClose} />
          <Button
            last
            text={isPending ? 'Saving...' : 'Save'}
            color="green"
            onClick={handleSubmit}
            disabled={isPending}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CustomDataModal;
