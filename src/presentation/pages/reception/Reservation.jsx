import React from 'react';
import ReservationManagement from '../../Components/Reservation/ReservationManagement';


const Reservation = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Chambres</h1>
      <ReservationManagement />
    </div>
  );
};

export default Reservation;