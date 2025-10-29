import React, { useState } from 'react';
import { FaSave, FaTimes, FaUser, FaCalendar, FaBed, FaMoneyBillWave } from 'react-icons/fa';

const ReservationForm = ({ reservation = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    clientName: reservation?.client?.name || '',
    clientEmail: reservation?.client?.email || '',
    clientPhone: reservation?.client?.phone || '',
    room: reservation?.room || '',
    guests: reservation?.guests || '1 adulte',
    checkIn: reservation?.dates?.split(' - ')[0] || '',
    checkOut: reservation?.dates?.split(' - ')[1] || '',
    amount: reservation?.amount?.replace('€', '') || '',
    status: reservation?.status?.text || 'En attente',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const rooms = [
    'Suite 301', 'Suite 305', 'Suite 401', 'Suite 405',
    'Chambre 101', 'Chambre 102', 'Chambre 103', 'Chambre 104',
    'Chambre 201', 'Chambre 202', 'Chambre 203', 'Chambre 204',
    'Chambre 205'
  ];

  const guestOptions = [
    '1 adulte',
    '2 adultes',
    '2 adultes, 1 enfant',
    '2 adultes, 2 enfants',
    '3 adultes',
    '4 adultes'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {reservation ? 'Modifier la réservation' : 'Nouvelle réservation'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations client */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaUser className="mr-2 text-blue-500" />
              Informations client
            </h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Détails du séjour */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaCalendar className="mr-2 text-green-500" />
              Détails du séjour
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chambre *
            </label>
            <select
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner une chambre</option>
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupants *
            </label>
            <select
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {guestOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'arrivée *
            </label>
            <input
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de départ *
            </label>
            <input
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Informations de paiement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaMoneyBillWave className="mr-2 text-purple-500" />
              Informations de paiement
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant total (€) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="En attente">En attente</option>
              <option value="Confirmée">Confirmée</option>
              <option value="Check-in">Check-in</option>
              <option value="Check-out">Check-out</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes supplémentaires
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notes ou demandes spéciales du client..."
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <FaSave className="mr-2" />
            {reservation ? 'Modifier' : 'Créer'} la réservation
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;