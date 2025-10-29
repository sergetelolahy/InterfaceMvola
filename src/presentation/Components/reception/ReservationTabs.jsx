// presentation/components/reception/ReservationTabs.jsx
import { useState } from 'react';
import { FaCalendarCheck, FaUsers, FaBed, FaFileInvoice, FaSearch, FaPlus, FaEye, FaSignInAlt, FaCheck, FaSignOutAlt, FaEdit } from 'react-icons/fa';

function ReservationTabs() {
  const [activeTab, setActiveTab] = useState('reservations');

  const reservations = [
    {
      id: "RES-2024-001",
      date: "Aujourd'hui, 09:30",
      client: { name: "Dupont Jean", email: "jean.dupont@email.com", phone: "+33 6 12 34 56 78" },
      room: "Suite 301",
      guests: "2 adultes, 1 enfant",
      dates: "15-20 Oct 2024",
      nights: "5 nuits",
      status: { text: "Confirmée", color: "green" },
      amount: "1 250€",
      deposit: "Acompte: 250€"
    },
    {
      id: "RES-2024-002",
      date: "Hier, 14:20",
      client: { name: "Martin Sophie", email: "s.martin@email.com", phone: "+33 6 98 76 54 32" },
      room: "Chambre 205",
      guests: "1 adulte",
      dates: "18-22 Oct 2024",
      nights: "4 nuits",
      status: { text: "En attente", color: "yellow" },
      amount: "480€",
      deposit: "Acompte: 0€"
    }
  ];

  const tabs = [
    { id: 'reservations', icon: <FaCalendarCheck />, text: 'Réservations' },
    { id: 'clients', icon: <FaUsers />, text: 'Clients' },
    { id: 'rooms', icon: <FaBed />, text: 'Chambres Disponibles' },
    { id: 'billing', icon: <FaFileInvoice />, text: 'Facturation' }
  ];

  const getStatusColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[color] || colors.green;
  };

  const handleAction = (action, reservationId) => {
    const messages = {
      view: `Voir détails de ${reservationId}`,
      checkin: `Check-in pour ${reservationId}`,
      checkout: `Check-out pour ${reservationId}`,
      confirm: `Confirmer ${reservationId}`,
      edit: `Modifier ${reservationId}`
    };
    alert(messages[action] || 'Action effectuée');
  };

  return (
    <div className="bg-white rounded-xl shadow mb-6">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-6 font-medium whitespace-nowrap flex items-center ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} <span className="ml-2">{tab.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Rechercher une réservation..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option>Toutes les réservations</option>
              <option>Confirmées</option>
              <option>En attente</option>
              <option>Annulées</option>
            </select>
            <input 
              type="date" 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" 
            />
          </div>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center w-full sm:w-auto justify-center">
          <FaPlus className="mr-2" /> Nouvelle réservation
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {['N° Réservation', 'Client', 'Chambre', 'Dates', 'Statut', 'Montant', 'Actions'].map((header) => (
                <th key={header} className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{reservation.id}</div>
                  <div className="text-gray-500 text-sm">{reservation.date}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{reservation.client.name}</div>
                  <div className="text-gray-500 text-sm">{reservation.client.email}</div>
                  <div className="text-gray-500 text-sm">{reservation.client.phone}</div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="text-gray-900">{reservation.room}</div>
                  <div className="text-gray-500 text-sm">{reservation.guests}</div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="text-gray-900">{reservation.dates}</div>
                  <div className="text-gray-500 text-sm">{reservation.nights}</div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status.color)}`}>
                    {reservation.status.text}
                  </span>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="text-gray-900 font-medium">{reservation.amount}</div>
                  <div className="text-gray-500 text-sm">{reservation.deposit}</div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    onClick={() => handleAction('view', reservation.id)}
                    title="Voir détails"
                  >
                    <FaEye />
                  </button>
                  {reservation.status.text === "Confirmée" && (
                    <button 
                      className="text-green-600 hover:text-green-900 mr-3"
                      onClick={() => handleAction('checkin', reservation.id)}
                      title="Check-in"
                    >
                      <FaSignInAlt />
                    </button>
                  )}
                  {reservation.status.text === "En attente" && (
                    <button 
                      className="text-green-600 hover:text-green-900 mr-3"
                      onClick={() => handleAction('confirm', reservation.id)}
                      title="Confirmer"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button 
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => handleAction('edit', reservation.id)}
                    title="Modifier"
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-700">
          Affichage de <span className="font-medium">1</span> à <span className="font-medium">2</span> sur <span className="font-medium">24</span> résultats
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50">
            Précédent
          </button>
          <button className="px-3 py-1 rounded border bg-blue-500 text-white">1</button>
          <button className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50">2</button>
          <button className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50">3</button>
          <button className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50">
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationTabs;