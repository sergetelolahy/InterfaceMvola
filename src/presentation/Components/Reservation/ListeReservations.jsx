import React, { useState, useMemo } from 'react';
import { FaBed, FaFilter, FaTimes, FaChevronDown, FaSearch, FaEdit, FaTrash, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useReservations } from '../../hooks/useReservation';

const ListeReservations = ({ onNouvelleReservation, onEditReservation, onViewReservation }) => {
  const {
    reservations,
    loading,
    error,
    deleteReservation,
    searchReservations
  } = useReservations();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  // ⚠️ AJOUT : États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Extraire les statuts uniques
  const statusOptions = useMemo(() => {
    const statuses = reservations
      .map(reservation => reservation.statut)
      .filter(Boolean)
      .filter((statut, index, array) => array.indexOf(statut) === index);
    
    return statuses.sort();
  }, [reservations]);

  // Filtrer les réservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const matchesSearch = 
        (reservation.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         reservation.client?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         reservation.client?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.chambres?.some(chambre => 
          chambre.numero?.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        reservation.id?.toString().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        selectedStatus.length === 0 || 
        selectedStatus.includes(reservation.statut);
      
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, selectedStatus]);

  // ⚠️ AJOUT : Calcul des données paginées
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReservations.slice(startIndex, endIndex);
  }, [filteredReservations, currentPage, itemsPerPage]);

  // ⚠️ AJOUT : Calcul du nombre total de pages
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  // ⚠️ AJOUT : Réinitialiser la pagination quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, filteredReservations.length]);

  // Gestion des statuts
  const toggleStatus = (status) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const selectAllStatus = () => {
    setSelectedStatus([...statusOptions]);
  };

  const clearAllStatus = () => {
    setSelectedStatus([]);
  };

  // Gestion de la suppression
  const handleDeleteReservation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        await deleteReservation(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus([]);
    setCurrentPage(1);
  };

  // Calcul des statistiques
  const stats = useMemo(() => ({
    total: filteredReservations.length,
    en_attente: filteredReservations.filter(r => r.statut === 'en_attente').length,
    confirmee: filteredReservations.filter(r => r.statut === 'confirmée').length,
    check_in: filteredReservations.filter(r => r.statut === 'check_in').length,
    check_out: filteredReservations.filter(r => r.statut === 'check_out').length,
    annulee: filteredReservations.filter(r => r.statut === 'annulée').length,
  }), [filteredReservations]);

  const getStatusIcon = (statut) => {
    switch(statut) {
      case 'confirmée': return '✅';
      case 'en_attente': return '⏳';
      case 'check_in': return '🏨';
      case 'check_out': return '🚪';
      case 'annulée': return '❌';
      default: return '📋';
    }
  };

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'confirmée': return 'bg-green-100 text-green-800 border border-green-200';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'check_in': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'check_out': return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'annulée': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString.replace(' ', 'T'));
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  // Formater le statut pour l'affichage
  const formatStatus = (statut) => {
    const statusMap = {
      'en_attente': 'En attente',
      'confirmée': 'Confirmée',
      'check_in': 'Check-in',
      'check_out': 'Check-out',
      'annulée': 'Annulée'
    };
    return statusMap[statut] || statut;
  };

  // Calculer le nombre de nuits
  const calculerNuits = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    try {
      const start = new Date(dateDebut.replace(' ', 'T'));
      const end = new Date(dateFin.replace(' ', 'T'));
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Formater le prix
  const formatPrix = (prix) => {
    return parseFloat(prix).toFixed(2) + '€';
  };

  // ⚠️ AJOUT : Composant de pagination
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          Affichage de <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
          <span className="font-semibold">
            {Math.min(currentPage * itemsPerPage, filteredReservations.length)}
          </span>{' '}
          sur <span className="font-semibold">{filteredReservations.length}</span> réservations
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sélecteur d'éléments par page */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>5 par page</option>
            <option value={10}>10 par page</option>
            <option value={20}>20 par page</option>
            <option value={50}>50 par page</option>
          </select>

          {/* Boutons de pagination */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>

            {startPage > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm"
                >
                  1
                </button>
                {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
              </>
            )}

            {pageNumbers.map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* En-tête avec statistiques */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <p className="text-gray-600 text-lg">
                <span className="font-semibold text-blue-600">{filteredReservations.length}</span> réservation(s)
              </p>
              {(searchTerm || selectedStatus.length > 0) && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  Filtres actifs
                </span>
              )}
            </div>
            
            {/* Statistiques rapides */}
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="text-sm text-green-600">
                ✅ {stats.confirmee} confirmée(s)
              </span>
              <span className="text-sm text-yellow-600">
                ⏳ {stats.en_attente} en attente
              </span>
              {stats.check_in > 0 && (
                <span className="text-sm text-blue-600">
                  🏨 {stats.check_in} check-in
                </span>
              )}
              {stats.check_out > 0 && (
                <span className="text-sm text-gray-600">
                  🚪 {stats.check_out} check-out
                </span>
              )}
            </div>

            {/* Affichage des erreurs */}
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={onNouvelleReservation}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaBed className="mr-3" /> 
              <span className="font-semibold">Nouvelle réservation</span>
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Barre de recherche */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher par client, numéro chambre..." 
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm group-hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Multiselect des statuts */}
          <div className="relative">
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-gray-700">
                  {selectedStatus.length === 0 
                    ? "Tous les statuts" 
                    : `${selectedStatus.length} statut(s) sélectionné(s)`
                  }
                </span>
              </div>
              <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown des statuts */}
            {isStatusOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      Statuts ({statusOptions.length})
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={selectAllStatus}
                        disabled={statusOptions.length === 0}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Tout
                      </button>
                      <button 
                        onClick={clearAllStatus}
                        disabled={selectedStatus.length === 0}
                        className="text-xs text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Aucun
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {statusOptions.length > 0 ? (
                    statusOptions.map((status) => (
                      <label 
                        key={status}
                        className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatus.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 flex-1">{formatStatus(status)}</span>
                        <div className={`w-3 h-3 rounded-full ${
                          selectedStatus.includes(status) ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </label>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Aucun statut trouvé
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bouton réinitialiser */}
          {(searchTerm || selectedStatus.length > 0) && (
            <button 
              onClick={resetFilters}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FaTimes className="mr-2" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Badges des filtres actifs */}
        {(searchTerm || selectedStatus.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="bg-blue-500 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg animate-fade-in">
                🔍 "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')}
                  className="hover:bg-blue-600 rounded-full p-1 transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStatus.map(status => (
              <span 
                key={status}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg animate-fade-in"
              >
                {getStatusIcon(status)} {formatStatus(status)}
                <button 
                  onClick={() => toggleStatus(status)}
                  className="hover:bg-green-600 rounded-full p-1 transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Tableau des réservations */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {/* ⚠️ SUPPRESSION : Colonne ID retirée */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chambres</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Création</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReservations.map((reservation) => {
                    const nuits = calculerNuits(reservation.date_debut, reservation.date_fin);
                    
                    return (
                      <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                        {/* ⚠️ SUPPRESSION : Cellule ID retirée */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.client?.prenom} {reservation.client?.nom}
                          </div>
                          <div className="text-sm text-gray-500">{reservation.client?.email}</div>
                          <div className="text-xs text-gray-400">{reservation.client?.tel}</div>
                        </td>
                        <td className="px-6 py-4">
                          {reservation.chambres && reservation.chambres.length > 0 ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {reservation.chambres.map(chambre => 
                                  `Chambre ${chambre.numero}`
                                ).join(', ')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {reservation.chambres.length} chambre(s)
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                {reservation.chambres.map(chambre => 
                                  formatPrix(chambre.pivot?.prix || chambre.prix)
                                ).join(' + ')}
                              </div>
                              <div className="text-xs text-blue-600">
                                Total: {formatPrix(
                                  reservation.chambres.reduce((total, chambre) => 
                                    total + parseFloat(chambre.pivot?.prix || chambre.prix || 0) * nuits, 0
                                  )
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">Aucune chambre</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(reservation.date_debut)}
                          </div>
                          <div className="text-xs text-gray-500">
                            au {formatDate(reservation.date_fin)}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            {nuits} nuit(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.statut)}`}>
                            {getStatusIcon(reservation.statut)} {formatStatus(reservation.statut)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(reservation.date_creation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onViewReservation && onViewReservation(reservation)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Voir détails"
                            >
                              <FaEye />
                            </button>
                            <button 
                              onClick={() => onEditReservation && onEditReservation(reservation)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDeleteReservation(reservation.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ⚠️ AJOUT : Pagination */}
            <Pagination />

            {filteredReservations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <div className="text-gray-500 text-lg">Aucune réservation trouvée</div>
                <div className="text-gray-400 text-sm mt-2">
                  {reservations.length === 0 
                    ? "Commencez par créer votre première réservation" 
                    : "Essayez de modifier vos critères de recherche"
                  }
                </div>
                {reservations.length === 0 && (
                  <button 
                    onClick={onNouvelleReservation}
                    className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Créer une réservation
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListeReservations;