import React from 'react';
import { FaEye, FaSignInAlt, FaCheck, FaSignOutAlt, FaEdit, FaTrash } from 'react-icons/fa';

const ReservationTable = ({ 
  reservations, 
  onView, 
  onCheckIn, 
  onCheckOut, 
  onConfirm, 
  onEdit, 
  onDelete,
  currentPage,
  totalPages,
  onPageChange 
}) => {
  const getStatusColor = (status) => {
    const colors = {
      'Confirmée': 'bg-green-100 text-green-800',
      'En attente': 'bg-yellow-100 text-yellow-800',
      'Check-in': 'bg-blue-100 text-blue-800',
      'Check-out': 'bg-gray-100 text-gray-800',
      'Annulée': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Réservation
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chambre
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{reservation.id}</div>
                  <div className="text-gray-500 text-sm">
                    {formatDate(reservation.createdAt)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{reservation.client.name}</div>
                  <div className="text-gray-500 text-sm">{reservation.client.email}</div>
                  <div className="text-gray-500 text-sm">{reservation.client.phone}</div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="text-gray-900 font-medium">{reservation.room}</div>
                  <div className="text-gray-500 text-sm">{reservation.guests}</div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="text-gray-900">
                    {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {reservation.nights} nuit(s)
                  </div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </span>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="text-gray-900 font-medium">{reservation.amount}€</div>
                  <div className="text-gray-500 text-sm">
                    {reservation.deposit > 0 ? `Acompte: ${reservation.deposit}€` : 'Acompte: 0€'}
                  </div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onView(reservation)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Voir détails"
                    >
                      <FaEye />
                    </button>
                    
                    {reservation.status === 'Confirmée' && (
                      <button 
                        onClick={() => onCheckIn(reservation)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Check-in"
                      >
                        <FaSignInAlt />
                      </button>
                    )}
                    
                    {reservation.status === 'En attente' && (
                      <button 
                        onClick={() => onConfirm(reservation)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Confirmer"
                      >
                        <FaCheck />
                      </button>
                    )}
                    
                    {reservation.status === 'Check-in' && (
                      <button 
                        onClick={() => onCheckOut(reservation)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Check-out"
                      >
                        <FaSignOutAlt />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => onEdit(reservation)}
                      className="text-gray-600 hover:text-gray-900 p-1 rounded"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    
                    <button 
                      onClick={() => onDelete(reservation)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationTable;