import React from 'react';
import TypeChambreManagement from '../Components/TypeChambres/TypeChambreManagement';

const TypeChambres = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des types des chamres</h1>
      <TypeChambreManagement />
    </div>
  )
}

export default TypeChambres;