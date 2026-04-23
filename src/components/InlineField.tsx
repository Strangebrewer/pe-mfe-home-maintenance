import React, { useState } from 'react';

type InlineFieldProps = {
  label: string;
  value: string | number | undefined;
  onSave: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
};

export default function InlineField({ label, value, onSave, type = 'text', placeholder }: InlineFieldProps) {
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
      <span className="tw:text-sm tw:text-gray-500 tw:w-28 tw:shrink-0">{label}</span>
      {editing ? (
        <div className="tw:flex tw:items-center tw:gap-2">
          <input
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="tw:border tw:border-gray-300 tw:rounded tw:px-2 tw:py-1 tw:text-sm tw:w-48 tw:focus:outline-none tw:focus:border-blue-400"
            autoFocus
          />
          <button onClick={handleSave} className="tw:text-xs tw:text-blue-600 tw:hover:text-blue-800 tw:font-medium">
            Save
          </button>
          <button
            onClick={() => { setDraft(value?.toString() ?? ''); setEditing(false); }}
            className="tw:text-xs tw:text-gray-400 tw:hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <span
          onClick={() => { setDraft(value?.toString() ?? ''); setEditing(true); }}
          className="tw:text-sm tw:text-gray-900 tw:cursor-pointer tw:hover:bg-gray-100 tw:rounded tw:px-1.5 tw:py-0.5 tw:-ml-1.5"
          title="Click to edit"
        >
          {value !== undefined && value !== '' ? (
            value
          ) : (
            <span className="tw:text-gray-400 tw:italic">{placeholder ?? 'Not set'}</span>
          )}
        </span>
      )}
    </div>
  );
}
