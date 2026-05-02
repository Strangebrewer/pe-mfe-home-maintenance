import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetHome, useUpdateHome, useDeleteHome } from '../gql/hooks/homeHooks';
import { useGetHomeTasks, useCreateHomeTask, useUpdateHomeTask, useDeleteHomeTask } from '../gql/hooks/homeTaskHooks';
import { useCreateHomeCompletion } from '../gql/hooks/homeCompletionHooks';
import { HomeTaskFrequency } from '../types/homeMaintenance';
import { FREQUENCY_LABELS, formatDate, getDaysUntilDue, sortTasksByUrgency, todayISO } from '../utils/taskUtils';
import InlineField from '../components/InlineField';
import Modal from '../components/Modal';

const inputCls =
  'tw:w-full tw:border tw:border-[#BC13FE] tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]';

export default function HomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: home, isPending: homePending, isError: homeError } = useGetHome(id!);
  const { data: tasks } = useGetHomeTasks(id);
  const sortedTasks = tasks ? sortTasksByUrgency(tasks) : [];

  const updateHome = useUpdateHome();
  const deleteHome = useDeleteHome();
  const createTask = useCreateHomeTask();
  const updateTask = useUpdateHomeTask();
  const deleteTask = useDeleteHomeTask(id!);
  const logCompletion = useCreateHomeCompletion();

  const [showAddTask, setShowAddTask] = useState(false);
  const [showCustomData, setShowCustomData] = useState(false);
  const [logTaskId, setLogTaskId] = useState<{ id: string; homeId: string; name: string } | null>(null);
  const [confirmDeleteHome, setConfirmDeleteHome] = useState(false);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<string | null>(null);

  if (homePending) return <div className="tw:p-6 tw:text-[#c4b5fd]">Loading...</div>;
  if (homeError || !home) return <div className="tw:p-6 tw:text-[#e22c5a]">Home not found.</div>;

  const customData = home.customData ? (JSON.parse(home.customData) as Record<string, string>) : {};

  const handleUpdateHome = (field: string, raw: string) => {
    const numericFields = ['yearBuilt', 'sqFootage'];
    const value = numericFields.includes(field) ? (raw ? Number(raw) : undefined) : (raw || undefined);
    updateHome.mutate({ id: home.id, [field]: value });
  };

  const handleDeleteHome = () => {
    deleteHome.mutate(home.id, { onSuccess: () => navigate('/') });
  };

  return (
    <div className="tw:max-w-3xl tw:mx-auto tw:px-4 tw:py-6">
      <button onClick={() => navigate('/home-maintenance')} className="tw:text-sm tw:text-[#c4b5fd] tw:hover:text-[#f0e6ff] tw:mb-4 tw:flex tw:items-center tw:gap-1">
        ← Back
      </button>

      {/* Home info */}
      <div className="tw:bg-[#1a0f2e] tw:rounded-lg tw:border tw:border-[rgba(188,19,254,0.3)] tw:p-5 tw:mb-6">
        <div className="tw:flex tw:items-start tw:justify-between tw:mb-3">
          <h1 className="tw:text-xl tw:font-bold tw:text-[#f0e6ff]">{home.address}</h1>
          <div className="tw:flex tw:gap-2">
            <button
              onClick={() => setShowCustomData(true)}
              className="tw:text-xs tw:text-[#c4b5fd] tw:hover:text-[#f0e6ff] tw:border tw:border-[rgba(188,19,254,0.3)] tw:rounded tw:px-2 tw:py-1"
            >
              Custom data
            </button>
            {confirmDeleteHome ? (
              <div className="tw:flex tw:items-center tw:gap-2">
                <span className="tw:text-xs tw:text-[#c4b5fd]">Delete home?</span>
                <button onClick={handleDeleteHome} className="tw:text-xs tw:text-[#e22c5a] tw:hover:text-white tw:font-medium">Yes</button>
                <button onClick={() => setConfirmDeleteHome(false)} className="tw:text-xs tw:text-[#c4b5fd]">No</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteHome(true)}
                className="tw:text-xs tw:text-[#e22c5a] tw:hover:text-white tw:border tw:border-[rgba(226,44,90,0.4)] tw:rounded tw:px-2 tw:py-1"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        <InlineField label="Address" value={home.address} onSave={(v) => handleUpdateHome('address', v)} />
        <InlineField label="Year built" value={home.yearBuilt} type="number" onSave={(v) => handleUpdateHome('yearBuilt', v)} placeholder="Not set" />
        <InlineField label="Sq footage" value={home.sqFootage} type="number" onSave={(v) => handleUpdateHome('sqFootage', v)} placeholder="Not set" />
        <InlineField label="Notes" value={home.notes} onSave={(v) => handleUpdateHome('notes', v)} placeholder="None" />

        {Object.keys(customData).length > 0 && (
          <div className="tw:mt-3 tw:pt-3 tw:border-t tw:border-[rgba(188,19,254,0.15)]">
            {Object.entries(customData).map(([key, val]) => (
              <div key={key} className="tw:flex tw:gap-3 tw:py-0.5">
                <span className="tw:text-sm tw:text-[#c4b5fd] tw:w-28 tw:shrink-0">{key}</span>
                <span className="tw:text-sm tw:text-[#f0e6ff]">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="tw:bg-[#1a0f2e] tw:rounded-lg tw:border tw:border-[rgba(188,19,254,0.3)]">
        <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:border-b tw:border-[rgba(188,19,254,0.2)]">
          <h2 className="tw:font-semibold tw:text-[#f0e6ff]">Tasks</h2>
          <button
            onClick={() => setShowAddTask(true)}
            className="tw:text-sm tw:bg-transparent tw:border tw:border-[#BC13FE] tw:text-[#BC13FE] tw:hover:bg-[#BC13FE] tw:hover:text-white tw:rounded tw:px-3 tw:py-1"
          >
            + Add task
          </button>
        </div>

        {sortedTasks.length === 0 && (
          <p className="tw:px-5 tw:py-4 tw:text-[#c4b5fd] tw:text-sm">No tasks yet.</p>
        )}

        {sortedTasks.map((task) => {
          const days = getDaysUntilDue(task);
          let dueLabel = '';
          let dueClass = 'tw:text-[#c4b5fd]';
          if (task.frequency === HomeTaskFrequency.AS_NEEDED) {
            dueLabel = 'As needed';
          } else if (!task.lastCompletionDate) {
            dueLabel = 'Never done';
            dueClass = 'tw:text-[#e22c5a]';
          } else if (days !== null && days < 0) {
            dueLabel = `${Math.abs(days)}d overdue`;
            dueClass = 'tw:text-[#e22c5a]';
          } else if (days !== null && days <= 7) {
            dueLabel = `Due in ${days}d`;
            dueClass = 'tw:text-[#00E5FF]';
          } else if (days !== null) {
            dueLabel = `Due in ${days}d`;
          }

          return (
            <div key={task.id} className="tw:px-5 tw:py-4 tw:border-b tw:border-[rgba(188,19,254,0.1)] tw:last:border-b-0">
              <div className="tw:flex tw:items-start tw:justify-between tw:gap-3 tw:mb-2">
                <div className="tw:flex-1 tw:min-w-0">
                  <InlineField
                    label="Name"
                    value={task.name}
                    onSave={(v) => updateTask.mutate({ id: task.id, homeId: task.homeId, name: v })}
                  />
                  <div className="tw:flex tw:items-center tw:gap-3 tw:py-1.5">
                    <span className="tw:text-sm tw:text-[#c4b5fd] tw:w-28 tw:shrink-0">Frequency</span>
                    <select
                      value={task.frequency}
                      onChange={(e) => updateTask.mutate({ id: task.id, homeId: task.homeId, frequency: e.target.value as HomeTaskFrequency })}
                      className="tw:border tw:border-[#BC13FE] tw:rounded tw:text-sm tw:px-2 tw:py-1 tw:bg-[#0d0a14] tw:text-[#f0e6ff]"
                    >
                      {Object.values(HomeTaskFrequency).map((f) => (
                        <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
                      ))}
                    </select>
                  </div>
                  <InlineField
                    label="Description"
                    value={task.description}
                    onSave={(v) => updateTask.mutate({ id: task.id, homeId: task.homeId, description: v })}
                    placeholder="None"
                  />
                </div>
                <div className="tw:flex tw:flex-col tw:items-end tw:gap-2 tw:shrink-0">
                  <span className={`tw:text-xs tw:font-medium ${dueClass}`}>{dueLabel}</span>
                  {task.lastCompletionDate && (
                    <span className="tw:text-xs tw:text-[#c4b5fd]">Last: {formatDate(task.lastCompletionDate)}</span>
                  )}
                  <div className="tw:flex tw:gap-2">
                    <button
                      onClick={() => setLogTaskId({ id: task.id, homeId: task.homeId, name: task.name })}
                      className="tw:text-xs tw:bg-transparent tw:border tw:border-[#51CB20] tw:text-[#51CB20] tw:hover:bg-[#51CB20] tw:hover:text-[#0d0a14] tw:rounded tw:px-2 tw:py-1"
                    >
                      Log
                    </button>
                    {confirmDeleteTask === task.id ? (
                      <div className="tw:flex tw:items-center tw:gap-1">
                        <button
                          onClick={() => deleteTask.mutate(task.id, { onSuccess: () => setConfirmDeleteTask(null) })}
                          className="tw:text-xs tw:text-[#e22c5a] tw:font-medium"
                        >
                          Yes
                        </button>
                        <button onClick={() => setConfirmDeleteTask(null)} className="tw:text-xs tw:text-[#c4b5fd]">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteTask(task.id)}
                        className="tw:text-xs tw:text-[#e22c5a] tw:hover:text-white"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task modal */}
      {showAddTask && (
        <AddTaskModal
          homeId={home.id}
          onClose={() => setShowAddTask(false)}
          onSave={(data) => createTask.mutate(data, { onSuccess: () => setShowAddTask(false) })}
          isPending={createTask.isPending}
        />
      )}

      {/* Custom Data modal */}
      {showCustomData && (
        <CustomDataModal
          customData={customData}
          onClose={() => setShowCustomData(false)}
          onSave={(data) =>
            updateHome.mutate(
              { id: home.id, customData: JSON.stringify(data) },
              { onSuccess: () => setShowCustomData(false) },
            )
          }
          isPending={updateHome.isPending}
        />
      )}

      {/* Log Completion modal */}
      {logTaskId && (
        <LogCompletionModal
          taskName={logTaskId.name}
          onClose={() => setLogTaskId(null)}
          onSave={(date, cost, notes) =>
            logCompletion.mutate(
              { taskId: logTaskId.id, homeId: logTaskId.homeId, date, cost, notes },
              { onSuccess: () => setLogTaskId(null) },
            )
          }
          isPending={logCompletion.isPending}
        />
      )}
    </div>
  );
}

function AddTaskModal({ homeId, onClose, onSave, isPending }: {
  homeId: string;
  onClose: () => void;
  onSave: (data: { homeId: string; name: string; frequency: HomeTaskFrequency; description?: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<HomeTaskFrequency>(HomeTaskFrequency.ANNUAL);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ homeId, name, frequency, description: description || undefined });
  };

  return (
    <Modal title="Add Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="tw:w-full tw:border tw:border-[#BC13FE] tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]"
            placeholder="Change HVAC filter" />
        </div>
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Frequency *</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value as HomeTaskFrequency)}
            className="tw:w-full tw:border tw:border-[#BC13FE] tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]">
            {Object.values(HomeTaskFrequency).map((f) => (
              <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className="tw:w-full tw:border tw:border-[#BC13FE] tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]" />
        </div>
        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-1">
          <button type="button" onClick={onClose} className="tw:text-sm tw:text-[#c4b5fd] tw:hover:text-[#f0e6ff] tw:px-4 tw:py-2">
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="tw:text-sm tw:border tw:border-[#BC13FE] tw:text-[#BC13FE] tw:hover:bg-[#BC13FE] tw:hover:text-white tw:disabled:opacity-50 tw:rounded tw:px-4 tw:py-2">
            {isPending ? 'Saving...' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CustomDataModal({ customData, onClose, onSave, isPending }: {
  customData: Record<string, string>;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
  isPending: boolean;
}) {
  const [rows, setRows] = useState<{ key: string; value: string }[]>(
    Object.entries(customData).map(([key, value]) => ({ key, value }))
  );

  const addRow = () => setRows((r) => [...r, { key: '', value: '' }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: 'key' | 'value', val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = {};
    rows.filter((r) => r.key.trim()).forEach((r) => { data[r.key.trim()] = r.value; });
    onSave(data);
  };

  return (
    <Modal title="Custom Data" onClose={onClose}>
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-3">
        {rows.map((row, i) => (
          <div key={i} className="tw:flex tw:gap-2 tw:items-center">
            <input
              value={row.key}
              onChange={(e) => updateRow(i, 'key', e.target.value)}
              placeholder="Field name"
              className="tw:flex-1 tw:border tw:border-[#BC13FE] tw:rounded tw:px-2 tw:py-1.5 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]"
            />
            <input
              value={row.value}
              onChange={(e) => updateRow(i, 'value', e.target.value)}
              placeholder="Value"
              className="tw:flex-1 tw:border tw:border-[#BC13FE] tw:rounded tw:px-2 tw:py-1.5 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]"
            />
            <button type="button" onClick={() => removeRow(i)} className="tw:text-[#e22c5a] tw:hover:text-white tw:text-lg tw:leading-none">×</button>
          </div>
        ))}
        <button type="button" onClick={addRow} className="tw:text-sm tw:text-[#00E5FF] tw:hover:text-white tw:text-left">
          + Add field
        </button>
        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-2">
          <button type="button" onClick={onClose} className="tw:text-sm tw:text-[#c4b5fd] tw:hover:text-[#f0e6ff] tw:px-4 tw:py-2">
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="tw:text-sm tw:border tw:border-[#BC13FE] tw:text-[#BC13FE] tw:hover:bg-[#BC13FE] tw:hover:text-white tw:disabled:opacity-50 tw:rounded tw:px-4 tw:py-2">
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function LogCompletionModal({ taskName, onClose, onSave, isPending }: {
  taskName: string;
  onClose: () => void;
  onSave: (date: string, cost?: number, notes?: string) => void;
  isPending: boolean;
}) {
  const [date, setDate] = useState(todayISO());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(date, cost ? Number(cost) : undefined, notes || undefined);
  };

  return (
    <Modal title={`Log: ${taskName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Date *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="tw:w-full tw:border tw:border-[#BC13FE] tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]" />
        </div>
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Cost</label>
          <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)}
            className="tw:w-full tw:border tw:border-[#BC13FE] tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]" placeholder="0.00" />
        </div>
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className="tw:w-full tw:border tw:border-[#BC13FE] tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]" />
        </div>
        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-1">
          <button type="button" onClick={onClose} className="tw:text-sm tw:text-[#c4b5fd] tw:hover:text-[#f0e6ff] tw:px-4 tw:py-2">
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="tw:text-sm tw:border tw:border-[#51CB20] tw:text-[#51CB20] tw:hover:bg-[#51CB20] tw:hover:text-[#0d0a14] tw:disabled:opacity-50 tw:rounded tw:px-4 tw:py-2">
            {isPending ? 'Saving...' : 'Log Completion'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
