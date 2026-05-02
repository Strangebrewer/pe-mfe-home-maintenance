import React from 'react';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="tw:fixed tw:inset-0 tw:bg-[rgba(13,10,20,0.85)] tw:flex tw:items-center tw:justify-center tw:z-50">
      <div className="tw:bg-[#1a0f2e] tw:border tw:border-[#BC13FE] tw:rounded-lg tw:shadow-xl tw:w-full tw:max-w-lg tw:mx-4 tw:max-h-[90vh] tw:flex tw:flex-col">
        <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:border-b tw:border-[rgba(188,19,254,0.2)] tw:shrink-0">
          <h2 className="tw:text-lg tw:font-semibold tw:text-[#f0e6ff]">{title}</h2>
          <button
            onClick={onClose}
            className="tw:text-[#c4b5fd] tw:hover:text-[#f0e6ff] tw:text-xl tw:leading-none"
          >
            ✕
          </button>
        </div>
        <div className="tw:p-5 tw:overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
