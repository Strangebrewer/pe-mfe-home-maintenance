import React, { useState } from 'react';

type InlineFieldProps = {
  label: string;
  value: string | number | undefined;
  onSave: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
};

export default function InlineField({
  label,
  value,
  onSave,
  type = 'text',
  placeholder,
}: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value?.toString() ?? '');

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setDraft(value?.toString() ?? '');
      setEditing(false);
    }
  };

  return (
    <div className="tw:flex tw:items-center tw:gap-3 tw:py-1.5">
      <span className="tw:text-sm tw:text-muted tw:w-28 tw:shrink-0">{label}</span>
      {editing ? (
        <div className="tw:flex tw:items-center tw:gap-2">
          <input
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="tw:border tw:border-purple tw:rounded tw:px-2 tw:py-1 tw:text-sm tw:w-48 tw:bg-bg tw:text-primary tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-purple"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="tw:text-xs tw:text-purple tw:hover:text-primary tw:font-medium"
          >
            Save
          </button>
          <button
            onClick={() => {
              setDraft(value?.toString() ?? '');
              setEditing(false);
            }}
            className="tw:text-xs tw:text-muted tw:hover:text-primary"
          >
            Cancel
          </button>
        </div>
      ) : (
        <span
          onClick={() => {
            setDraft(value?.toString() ?? '');
            setEditing(true);
          }}
          className="tw:text-sm tw:text-primary tw:cursor-pointer tw:hover:bg-purpleFaint tw:rounded tw:px-1.5 tw:py-0.5 tw:-ml-1.5"
          title="Click to edit"
        >
          {value !== undefined && value !== '' ? (
            value
          ) : (
            <span className="tw:text-muted tw:italic">{placeholder ?? 'Not set'}</span>
          )}
        </span>
      )}
    </div>
  );
}
