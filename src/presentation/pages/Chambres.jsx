import React from 'react';
import ChambreManagement from '../components/chambres/ChambreManagement';

const Chambres = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Chambres</h1>
      <ChambreManagement />
    </div>
  );
};

export default Chambres;