import React from 'react';
import ClientManagement from '../../Components/Client/ClientManagement';

const Client = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Clients</h1>
      <ClientManagement />
    </div>
  )
}

export default Client;