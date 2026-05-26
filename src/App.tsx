import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import HomeDetailPage from './pages/HomeDetailPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import './index.css';

function NotFound() {
  return <div className="tw:p-6 tw:text-gray-500">Not found.</div>;
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route index element={<MainPage />} />
      <Route path="homes/:id" element={<HomeDetailPage />} />
      <Route path="vehicles/:id" element={<VehicleDetailPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
