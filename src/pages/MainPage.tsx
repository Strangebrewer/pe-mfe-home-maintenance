import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetHomes, useCreateHome, useSetPrimaryHome } from '../gql/hooks/homeHooks';
import { useGetVehicles, useCreateVehicle } from '../gql/hooks/vehicleHooks';
import { useGetHomeTasks } from '../gql/hooks/homeTaskHooks';
import { useCreateHomeCompletion } from '../gql/hooks/homeCompletionHooks';
import { Home, HomeTaskFrequency, Vehicle } from '../types/homeMaintenance';
import { FREQUENCY_LABELS, getDaysUntilDue, formatDate, sortTasksByUrgency, todayISO } from '../utils/taskUtils';
import Modal from '../components/Modal';
import { GhostButton, Button } from '@bka-stuff/pe-mfe-utils';

const inputCls =
  'tw:w-full tw:border tw:border-[#BC13FE] tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:bg-[#0d0a14] tw:text-[#f0e6ff] tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#BC13FE]';

type LogCompletionForm = { taskId: string; homeId: string; taskName: string };

export default function MainPage() {
  const navigate = useNavigate();
  const { data: homes, isPending: homesPending, isError: homesError } = useGetHomes();
  const { data: vehicles, isPending: vehiclesPending, isError: vehiclesError } = useGetVehicles();

  const [selectedHomeId, setSelectedHomeId] = useState<string | undefined>(undefined);
  const [showAddHome, setShowAddHome] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [logCompletion, setLogCompletion] = useState<LogCompletionForm | null>(null);

  const primaryHome = homes?.find((h) => h.isPrimary) ?? homes?.[0];
  const activeHomeId = selectedHomeId ?? primaryHome?.id;
  const activeHome = homes?.find((h) => h.id === activeHomeId) ?? primaryHome;

  const { data: tasks } = useGetHomeTasks(activeHomeId);
  const sortedTasks = tasks ? sortTasksByUrgency(tasks) : [];

  const createHome = useCreateHome();
  const createVehicle = useCreateVehicle();
  const setPrimary = useSetPrimaryHome();
  const logCompletion_ = useCreateHomeCompletion();

  return (
    <div className="tw:max-w-4xl tw:mx-auto tw:px-4 tw:py-6">
      {/* Homes section */}
      <div className="tw:mb-8">
        <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
          <div className="tw:flex tw:items-center tw:gap-3">
            <h1 className="tw:text-2xl tw:font-bold tw:text-[#f0e6ff]">
              {activeHome?.address ?? 'Home Maintenance'}
            </h1>
            {homes && homes.length > 1 && (
              <select
                value={activeHomeId}
                onChange={(e) => setSelectedHomeId(e.target.value)}
                className="tw:border tw:border-[#BC13FE] tw:rounded tw:text-sm tw:px-2 tw:py-1 tw:bg-[#0d0a14] tw:text-[#f0e6ff]"
              >
                {homes.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.address}{h.isPrimary ? ' (primary)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="tw:flex tw:gap-2">
            {activeHome && !activeHome.isPrimary && (
              <GhostButton last color="violet" text="Set as primary" onClick={() => setPrimary.mutate(activeHome.id)}/>
            )}
            {activeHome && (
              <GhostButton last color="cyan" text="Manage home →" onClick={() => navigate(`/home-maintenance/homes/${activeHome.id}`)} />
            )}
            <Button last variant='purple' text="+ Add home" onClick={() => setShowAddHome(true)} />
          </div>
        </div>

        {homesPending && <p className="tw:text-[#c4b5fd]">Loading...</p>}
        {homesError && <p className="tw:text-[#e22c5a]">Failed to load homes.</p>}

        {activeHome && (
          <div className="tw:flex tw:gap-4 tw:text-sm tw:text-[#c4b5fd] tw:mb-4">
            {activeHome.yearBuilt && <span>Built {activeHome.yearBuilt}</span>}
            {activeHome.sqFootage && <span>{activeHome.sqFootage.toLocaleString()} sq ft</span>}
          </div>
        )}

        {/* Upcoming tasks */}
        <div className="tw:bg-[#1a0f2e] tw:rounded-lg tw:border tw:border-[rgba(188,19,254,0.3)]">
          <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-[rgba(188,19,254,0.2)]">
            <h2 className="tw:font-semibold tw:text-[#f0e6ff]">Upcoming Tasks</h2>
          </div>
          {!activeHomeId && !homesPending && (
            <p className="tw:px-4 tw:py-4 tw:text-[#c4b5fd] tw:text-sm">Add a home to get started.</p>
          )}
          {sortedTasks.length === 0 && activeHomeId && (
            <p className="tw:px-4 tw:py-4 tw:text-[#c4b5fd] tw:text-sm">No tasks yet.</p>
          )}
          {sortedTasks.map((task) => {
            const days = getDaysUntilDue(task);
            let dueLabel = '';
            let dueClass = 'tw:text-[#c4b5fd]';
            if (task.frequency === HomeTaskFrequency.AS_NEEDED) {
              dueLabel = 'As needed';
            } else if (!task.lastCompletionDate) {
              dueLabel = 'Never done';
              dueClass = 'tw:text-[#e22c5a] tw:font-medium';
            } else if (days !== null && days < 0) {
              dueLabel = `${Math.abs(days)}d overdue`;
              dueClass = 'tw:text-[#e22c5a] tw:font-medium';
            } else if (days !== null && days <= 7) {
              dueLabel = days === 0 ? 'Due today' : `Due in ${days}d`;
              dueClass = 'tw:text-[#00E5FF] tw:font-medium';
            } else if (days !== null) {
              dueLabel = `Due in ${days}d`;
            }

            return (
              <div key={task.id} className="tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-3 tw:border-b tw:border-[rgba(188,19,254,0.1)] tw:last:border-b-0">
                <div className="tw:flex-1 tw:min-w-0">
                  <span className="tw:text-sm tw:font-medium tw:text-[#f0e6ff]">{task.name}</span>
                  <span className="tw:ml-2 tw:text-xs tw:text-[#c4b5fd]">{FREQUENCY_LABELS[task.frequency]}</span>
                  {task.lastCompletionDate && (
                    <span className="tw:ml-2 tw:text-xs tw:text-[#c4b5fd]">
                      Last: {formatDate(task.lastCompletionDate)}
                    </span>
                  )}
                </div>
                <span className={`tw:text-xs tw:shrink-0 ${dueClass}`}>{dueLabel}</span>
                <button
                  onClick={() => setLogCompletion({ taskId: task.id, homeId: task.homeId, taskName: task.name })}
                  className="tw:text-xs tw:bg-transparent tw:border tw:border-[#51CB20] tw:text-[#51CB20] tw:hover:bg-[#51CB20] tw:hover:text-[#0d0a14] tw:rounded tw:px-2 tw:py-1 tw:shrink-0"
                >
                  Log
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vehicles section */}
      <div>
        <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
          <h2 className="tw:text-xl tw:font-bold tw:text-[#f0e6ff]">Vehicles</h2>
          <Button last text="+ Add vehicle" variant='purple' onClick={() => setShowAddVehicle(true)}/>
        </div>

        {vehiclesPending && <p className="tw:text-[#c4b5fd]">Loading...</p>}
        {vehiclesError && <p className="tw:text-[#e22c5a]">Failed to load vehicles.</p>}
        {vehicles?.length === 0 && <p className="tw:text-[#c4b5fd] tw:text-sm">No vehicles yet.</p>}

        <div className="tw:grid tw:gap-3">
          {vehicles?.map((v) => (
            <button
              key={v.id}
              onClick={() => navigate(`/home-maintenance/vehicles/${v.id}`)}
              className="tw:bg-[#1a0f2e] tw:border tw:border-[rgba(188,19,254,0.3)] tw:rounded-lg tw:px-4 tw:py-3 tw:text-left tw:hover:border-[#BC13FE] tw:hover:bg-[rgba(188,19,254,0.08)] tw:hover:[box-shadow:0_0_10px_rgba(0,229,255,0.2)] tw:transition-all"
            >
              <div className="tw:flex tw:items-center tw:justify-between">
                <span className="tw:font-medium tw:text-[#f0e6ff]">{v.year} {v.make} {v.model}</span>
                <span className="tw:text-sm tw:text-[#c4b5fd]">{v.mileage?.toLocaleString()} mi →</span>
              </div>
              {(v.color || v.trim) && (
                <span className="tw:text-sm tw:text-[#c4b5fd]">
                  {[v.color, v.trim].filter(Boolean).join(' · ')}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add Home modal */}
      {showAddHome && (
        <AddHomeModal
          onClose={() => setShowAddHome(false)}
          onSave={(data) => createHome.mutate(data, { onSuccess: () => setShowAddHome(false) })}
          isPending={createHome.isPending}
        />
      )}

      {/* Add Vehicle modal */}
      {showAddVehicle && (
        <AddVehicleModal
          onClose={() => setShowAddVehicle(false)}
          onSave={(data) => createVehicle.mutate(data, { onSuccess: () => setShowAddVehicle(false) })}
          isPending={createVehicle.isPending}
        />
      )}

      {/* Log Completion modal */}
      {logCompletion && (
        <LogCompletionModal
          taskName={logCompletion.taskName}
          onClose={() => setLogCompletion(null)}
          onSave={(date, cost, notes) =>
            logCompletion_.mutate(
              { taskId: logCompletion.taskId, homeId: logCompletion.homeId, date, cost, notes },
              { onSuccess: () => setLogCompletion(null) },
            )
          }
          isPending={logCompletion_.isPending}
        />
      )}
    </div>
  );
}

function AddHomeModal({ onClose, onSave, isPending }: {
  onClose: () => void;
  onSave: (data: Omit<Home, 'id' | 'isPrimary'>) => void;
  isPending: boolean;
}) {
  const [address, setAddress] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [sqFootage, setSqFootage] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      address,
      yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
      sqFootage: sqFootage ? Number(sqFootage) : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <Modal title="Add Home" onClose={onClose}>
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Address *</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className={inputCls}
            placeholder="123 Main St, City, ST"
          />
        </div>
        <div className="tw:grid tw:grid-cols-2 tw:gap-3">
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Year Built</label>
            <input
              type="number"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(e.target.value)}
              className={inputCls}
              placeholder="1990"
            />
          </div>
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Sq Footage</label>
            <input
              type="number"
              value={sqFootage}
              onChange={(e) => setSqFootage(e.target.value)}
              className={inputCls}
              placeholder="2000"
            />
          </div>
        </div>
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={inputCls}
          />
        </div>
        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-1">
          <button type="button" onClick={onClose} className="tw:text-sm tw:text-[#c4b5fd] tw:hover:text-[#f0e6ff] tw:px-4 tw:py-2">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="tw:text-sm tw:border tw:border-[#BC13FE] tw:text-[#BC13FE] tw:hover:bg-[#BC13FE] tw:hover:text-white tw:disabled:opacity-50 tw:rounded tw:px-4 tw:py-2"
          >
            {isPending ? 'Saving...' : 'Add Home'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddVehicleModal({ onClose, onSave, isPending }: {
  onClose: () => void;
  onSave: (data: Omit<Vehicle, 'id'>) => void;
  isPending: boolean;
}) {
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [color, setColor] = useState('');
  const [trim, setTrim] = useState('');
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [insuranceId, setInsuranceId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      year: Number(year),
      make,
      model,
      mileage: Number(mileage),
      color: color || undefined,
      trim: trim || undefined,
      plate: plate || undefined,
      vin: vin || undefined,
      insuranceId: insuranceId || undefined,
    });
  };

  return (
    <Modal title="Add Vehicle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
        <div className="tw:grid tw:grid-cols-3 tw:gap-3">
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Year *</label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required
              className={inputCls} placeholder="2020" />
          </div>
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Make *</label>
            <input value={make} onChange={(e) => setMake(e.target.value)} required
              className={inputCls} placeholder="Toyota" />
          </div>
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Model *</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} required
              className={inputCls} placeholder="Camry" />
          </div>
        </div>
        <div className="tw:grid tw:grid-cols-2 tw:gap-3">
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Mileage *</label>
            <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} required
              className={inputCls} placeholder="50000" />
          </div>
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Color</label>
            <input value={color} onChange={(e) => setColor(e.target.value)}
              className={inputCls} placeholder="Silver" />
          </div>
        </div>
        <div className="tw:grid tw:grid-cols-3 tw:gap-3">
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Trim</label>
            <input value={trim} onChange={(e) => setTrim(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Plate</label>
            <input value={plate} onChange={(e) => setPlate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">VIN</label>
            <input value={vin} onChange={(e) => setVin(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Insurance ID</label>
          <input value={insuranceId} onChange={(e) => setInsuranceId(e.target.value)} className={inputCls} />
        </div>
        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-1">
          <button type="button" onClick={onClose} className="tw:text-sm tw:text-[#c4b5fd] tw:hover:text-[#f0e6ff] tw:px-4 tw:py-2">
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="tw:text-sm tw:border tw:border-[#BC13FE] tw:text-[#BC13FE] tw:hover:bg-[#BC13FE] tw:hover:text-white tw:disabled:opacity-50 tw:rounded tw:px-4 tw:py-2">
            {isPending ? 'Saving...' : 'Add Vehicle'}
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
            className={inputCls} />
        </div>
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Cost</label>
          <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)}
            className={inputCls} placeholder="0.00" />
        </div>
        <div>
          <label className="tw:block tw:text-sm tw:font-medium tw:text-[#c4b5fd] tw:mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className={inputCls} />
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
