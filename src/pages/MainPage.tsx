import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetHomes, useSetPrimaryHome } from '../gql/hooks/homeHooks';
import { GhostButton, Button } from '@bka-stuff/pe-mfe-utils';
import AddHomeModal from '../components/home/modals/AddHomeModal';
import HomeTasks from '../components/home/HomeTasks';
import VehiclesList from '../components/home/VehiclesList';

export type LogCompletionForm = { id: string; homeId: string; name: string };

export default function MainPage() {
  const navigate = useNavigate();
  const { data: homes, isPending: homesPending, isError: homesError } = useGetHomes();

  const [selectedHomeId, setSelectedHomeId] = useState<string | undefined>(undefined);
  const [showAddHome, setShowAddHome] = useState(false);

  const primaryHome = homes?.find((h: any) => h.isPrimary) ?? homes?.[0];
  const activeHomeId = selectedHomeId ?? primaryHome?.id;
  const activeHome = homes?.find((h: any) => h.id === activeHomeId) ?? primaryHome;

  const setPrimary = useSetPrimaryHome();

  return (
    <div className="tw:max-w-4xl tw:mx-auto tw:px-4 tw:py-6">
      <div className="tw:mb-8">
        <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
          <div className="tw:flex tw:items-center tw:gap-3">
            {homes && homes.length > 1 ? (
              <select
                value={activeHomeId}
                onChange={(e) => setSelectedHomeId(e.target.value)}
                className="tw:max-w-[480px] tw:bg-transparent tw:border-0 tw:border-b tw:border-purpleBorder tw:text-2xl tw:font-bold tw:text-primary tw:cursor-pointer tw:pr-6 tw:appearance-auto tw:focus:outline-none"
              >
                {homes.map((h: any) => (
                  <option key={h.id} value={h.id} className="tw:bg-surface">
                    {h.address}
                    {h.isPrimary ? ' (primary)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <h1 className="tw:text-2xl tw:font-bold tw:text-primary">
                {activeHome?.address ?? 'Home Maintenance'}
              </h1>
            )}
          </div>

          <div className="tw:flex tw:gap-2">
            {activeHome && !activeHome.isPrimary && (
              <GhostButton
                last
                color="purple"
                text="Set as primary"
                onClick={() => setPrimary.mutate(activeHome.id)}
              />
            )}

            {activeHome && (
              <GhostButton
                last
                color="blue"
                text="Manage home →"
                onClick={() => navigate(`/home-maintenance/homes/${activeHome.id}`)}
              />
            )}

            <Button last color="purple" text="+ Add home" onClick={() => setShowAddHome(true)} />
          </div>
        </div>

        {homesPending && <p className="tw:text-muted">Loading...</p>}
        {homesError && <p className="tw:text-red">Failed to load homes.</p>}

        {activeHome && (
          <div className="tw:flex tw:gap-4 tw:text-sm tw:text-muted tw:mb-4">
            {activeHome.yearBuilt && <span>Built {activeHome.yearBuilt}</span>}
            {activeHome.sqFootage && <span>{activeHome.sqFootage.toLocaleString()} sq ft</span>}
          </div>
        )}

        <HomeTasks activeHomeId={activeHomeId} homesPending={homesPending} />
      </div>

      <VehiclesList />

      <AddHomeModal isOpen={showAddHome} onClose={() => setShowAddHome(false)} />
    </div>
  );
}
