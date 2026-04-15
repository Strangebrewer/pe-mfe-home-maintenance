import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useGetHomes } from './gql/hooks/homeHooks';
import { useGetVehicles } from './gql/hooks/vehicleHooks';
import './index.css';

function HomeMaintenanceIndex() {
  const { data: homes, isPending: homesPending, isError: homesError } = useGetHomes();
  const { data: vehicles, isPending: vehiclesPending, isError: vehiclesError } = useGetVehicles();

  return (
    <div>
      <h1>Home Maintenance</h1>

      <h2>Homes</h2>
      {homesPending && <div>Loading...</div>}
      {homesError && <div>Failed to load homes.</div>}
      {homes?.length === 0 && <p>No homes yet.</p>}
      <ul>
        {homes?.map((home) => (
          <li key={home.id}>{home.address}</li>
        ))}
      </ul>

      <h2>Vehicles</h2>
      {vehiclesPending && <div>Loading...</div>}
      {vehiclesError && <div>Failed to load vehicles.</div>}
      {vehicles?.length === 0 && <p>No vehicles yet.</p>}
      <ul>
        {vehicles?.map((v) => (
          <li key={v.id}>{v.year} {v.make} {v.model}</li>
        ))}
      </ul>
    </div>
  );
}

function NotFound() {
  return <div>Not found.</div>;
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route index element={<HomeMaintenanceIndex />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
