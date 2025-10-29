import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaFilter, FaTimes, FaChevronDown, FaDownload } from 'react-icons/fa';
import ReservationTable from './ReservationTable';
import ReservationForm from './ReservationForm';

/**
 * Composant principal de gestion des réservations
 * Gère l'affichage, la création, la modification et la suppression des réservations
 */
const ReservationManagement = () => {
  // États pour la gestion de l'interface
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Configuration de la pagination
  const itemsPerPage = 10;

  // Données mockées pour les réservations
  const [reservations, setReservations] = useState([
    {
      id: "RES-2024-001",
      client: { 
        nom: "Dupont Jean", 
        email: "jean.dupont@email.com", 
        telephone: "+33 6 12 34 56 78" 
      },
      numeroChambre: "Suite 301",
      nbPersonnes: 3,
      dateArrivee: "2024-10-15",
      dateDepart: "2024-10-20",
      nbNuits: 5,
      statut: "Confirmée",
      montantTotal: "1250",
      acompte: "250",
      dateCreation: "2024-10-01T09:30:00"
    },
    {
      id: "RES-2024-002",
      client: { 
        nom: "Martin Sophie", 
        email: "s.martin@email.com", 
        telephone: "+33 6 98 76 54 32" 
      },
      numeroChambre: "Chambre 205",
      nbPersonnes: 1,
      dateArrivee: "2024-10-18",
      dateDepart: "2024-10-22",
      nbNuits: 4,
      statut: "En attente",
      montantTotal: "480",
      acompte: "0",
      dateCreation: "2024-09-30T14:20:00"
    },
    {
      id: "RES-2024-003",
      client: { 
        nom: "Bernard Pierre", 
        email: "p.bernard@email.com", 
        telephone: "+33 6 45 67 89 10" 
      },
      numeroChambre: "Chambre 112",
      nbPersonnes: 4,
      dateArrivee: "2024-10-25",
      dateDepart: "2024-10-27",
      nbNuits: 2,
      statut: "Check-in",
      montantTotal: "360",
      acompte: "360",
      dateCreation: "2024-10-15T10:45:00"
    },
    {
      id: "RES-2024-004",
      client: { 
        nom: "Moreau Alice", 
        email: "a.moreau@email.com", 
        telephone: "+33 6 11 22 33 44" 
      },
      numeroChambre: "Suite 401",
      nbPersonnes: 4,
      dateArrivee: "2024-10-20",
      dateDepart: "2024-10-25",
      nbNuits: 5,
      statut: "Annulée",
      montantTotal: "1500",
      acompte: "250",
      dateCreation: "2024-10-14T16:30:00"
    },
    {
      id: "RES-2024-005",
      client: { 
        nom: "Dupuis Marc", 
        email: "m.dupuis@email.com", 
        telephone: "+33 6 55 66 77 88" 
      },
      numeroChambre: "Chambre 208",
      nbPersonnes: 2,
      dateArrivee: "2024-10-16",
      dateDepart: "2024-10-18",
      nbNuits: 2,
      statut: "Confirmée",
      montantTotal: "320",
      acompte: "100",
      dateCreation: "2024-10-02T11:20:00"
    },
    {
      id: "RES-2024-006",
      client: { 
        nom: "Leroy Claire", 
        email: "c.leroy@email.com", 
        telephone: "+33 6 99 88 77 66" 
      },
      numeroChambre: "Suite 305",
      nbPersonnes: 2,
      dateArrivee: "2024-10-22",
      dateDepart: "2024-10-25",
      nbNuits: 3,
      statut: "Check-out",
      montantTotal: "750",
      acompte: "200",
      dateCreation: "2024-10-05T08:15:00"
    }
  ]);

  /**
   * Extrait les statuts de réservation uniques pour le filtre
   */
  const statusOptions = useMemo(() => {
    const statuses = reservations
      .map(reservation => reservation.statut)
      .filter(Boolean)
      .filter((statut, index, array) => array.indexOf(statut) === index);
    
    return statuses.sort();
  }, [reservations]);

  /**
   * Filtre les réservations selon le terme de recherche et les statuts sélectionnés
   */
  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const matchesSearch = 
        reservation.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.numeroChambre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        selectedStatus.length === 0 || 
        selectedStatus.includes(reservation.statut);
      
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, selectedStatus]);

  /**
   * Gère la sélection/déselection d'un statut
   */
  const toggleStatus = (status) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setCurrentPage(1);
  };

  /**
   * Sélectionne tous les statuts
   */
  const selectAllStatus = () => {
    setSelectedStatus([...statusOptions]);
    setCurrentPage(1);
  };

  /**
   * Désélectionne tous les statuts
   */
  const clearAllStatus = () => {
    setSelectedStatus([]);
    setCurrentPage(1);
  };

  /**
   * Gère la création d'une nouvelle réservation
   */
  const handleCreate = () => {
    setEditingReservation(null);
    setShowForm(true);
  };

  /**
   * Gère l'édition d'une réservation existante
   */
  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setShowForm(true);
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (reservationData) => {
    setLoading(true);
    try {
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingReservation) {
        // Modification
        setReservations(prev => prev.map(res => 
          res.id === editingReservation.id 
            ? { 
                ...res, 
                ...reservationData,
                client: { ...res.client, ...reservationData.client }
              }
            : res
        ));
      } else {
        // Nouvelle réservation
        const newReservation = {
          id: `RES-2024-${String(reservations.length + 1).padStart(3, '0')}`,
          ...reservationData,
          client: {
            nom: reservationData.clientNom,
            email: reservationData.clientEmail,
            telephone: reservationData.clientTelephone
          },
          dateCreation: new Date().toISOString(),
          nbNuits: calculateNights(reservationData.dateArrivee, reservationData.dateDepart)
        };
        setReservations(prev => [...prev, newReservation]);
        setCurrentPage(1);
      }
      setShowForm(false);
      setEditingReservation(null);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Annule l'édition/création
   */
  const handleCancel = () => {
    setShowForm(false);
    setEditingReservation(null);
    setError(null);
  };

  /**
   * Gère la suppression d'une réservation
   */
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      setLoading(true);
      try {
        // Simuler un délai d'API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setReservations(prev => prev.filter(res => res.id !== id));
        
        const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
        if (filteredReservations.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Gère le changement de page
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  /**
   * Réinitialise tous les filtres
   */
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus([]);
    setCurrentPage(1);
  };

  /**
   * Exporte les réservations en CSV
   */
  const handleExport = () => {
    const csvContent = [
      ['ID', 'Client', 'Email', 'Téléphone', 'Chambre', 'Arrivée', 'Départ', 'Statut', 'Montant'],
      ...filteredReservations.map(res => [
        res.id,
        res.client.nom,
        res.client.email,
        res.client.telephone,
        res.numeroChambre,
        res.dateArrivee,
        res.dateDepart,
        res.statut,
        res.montantTotal
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Calcule le nombre de nuits entre deux dates
   */
  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  // Calcul des statistiques
  const stats = useMemo(() => ({
    total: filteredReservations.length,
    confirmed: filteredReservations.filter(r => r.statut === 'Confirmée').length,
    pending: filteredReservations.filter(r => r.statut === 'En attente').length,
    checkedIn: filteredReservations.filter(r => r.statut === 'Check-in').length,
    checkedOut: filteredReservations.filter(r => r.statut === 'Check-out').length
  }), [filteredReservations]);

  // Affichage du formulaire
  if (showForm) {
    return (
      <ReservationForm
        reservation={editingReservation}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* ========== EN-TÊTE AVEC RECHERCHE ET FILTRES ========== */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Titre et informations */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <p className="text-gray-600 text-lg">
                <span className="font-semibold text-blue-600">{filteredReservations.length}</span> réservation(s) trouvée(s)
                {reservations.length > 0 && (
                  <span className="text-gray-400 ml-2">
                    (sur {reservations.length} au total)
                  </span>
                )}
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
                ✅ {stats.confirmed} confirmée(s)
              </span>
              <span className="text-sm text-yellow-600">
                ⏳ {stats.pending} en attente
              </span>
              <span className="text-sm text-blue-600">
                🏨 {stats.checkedIn} check-in
              </span>
              <span className="text-sm text-gray-600">
                🚪 {stats.checkedOut} check-out
              </span>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleExport}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FaDownload className="mr-3" /> 
              <span className="font-semibold">Exporter</span>
            </button>
            
            <button 
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaPlus className="mr-3" /> 
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
              placeholder="Rechercher par client, chambre, email..." 
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm group-hover:shadow-md"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
                {/* En-tête du dropdown */}
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

                {/* Liste des statuts */}
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
                        <span className="text-gray-700 flex-1">{status}</span>
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
              onClick={handleResetFilters}
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
                {getStatusIcon(status)} {status}
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
      
      {/* ========== TABLEAU DES RÉSERVATIONS ========== */}
      <ReservationTable
        reservations={filteredReservations}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

/**
 * Retourne l'icône correspondant au statut
 */
const getStatusIcon = (status) => {
  switch (status) {
    case 'Confirmée': return '✅';
    case 'En attente': return '⏳';
    case 'Check-in': return '🏨';
    case 'Check-out': return '🚪';
    case 'Annulée': return '❌';
    default: return '📋';
  }
};

export default ReservationManagement;