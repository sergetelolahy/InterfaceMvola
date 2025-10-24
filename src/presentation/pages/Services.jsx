import React from 'react';
import ServiceManagement from '../Components/Services/ServicesManagement';
import TypeChambreManagement from '../Components/TypeChambres/TypeChambreManagement';

const Services = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Services</h1>
      <ServiceManagement />
    </div>
  )
}

export default Services;