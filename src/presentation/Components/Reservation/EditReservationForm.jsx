import React, { useState, useEffect } from 'react';
import { FaBed, FaUser, FaCalendarAlt, FaMoneyBillWave, FaSave, FaTimes, FaPlus, FaTrash, FaSearch, FaCalculator, FaLock } from 'react-icons/fa';
import { useChambres } from '../../hooks/useChambres';

const EditReservationForm = ({ reservation, onSubmit, onCancel }) => {
  const { getChambresEditDisponibles, chambres: allChambres } = useChambres();
  
  const [formData, setFormData] = useState({
    id_client: '',
    id_chambre: [],
    date_debut: '',
    date_fin: '',
    statut: '',
    montant_total: 0,
    acompte: 0,
    check_in_time: '',
    check_out_time: ''
  });

  const [selectedChambre, setSelectedChambre] = useState('');
  const [errors, setErrors] = useState({});
  const [chambresDisponibles, setChambresDisponibles] = useState([]);
  const [loadingChambres, setLoadingChambres] = useState(false);
  const [errorChambres, setErrorChambres] = useState(null);

  // Fonction pour calculer le montant total à partir des chambres de la réservation
  const calculerMontantTotalInitial = (reservationData) => {
    if (!reservationData) return 0;
    
    // Si le montant total est déjà défini dans la réservation, l'utiliser
    if (reservationData.montant_total && reservationData.montant_total > 0) {
      return reservationData.montant_total;
    }
    
    // Si tarif_template est disponible, l'utiliser
    if (reservationData.tarif_template && reservationData.tarif_template > 0) {
      return reservationData.tarif_template;
    }
    
    // Sinon, calculer à partir des chambres
    if (reservationData.chambres && reservationData.chambres.length > 0) {
      // Calculer le nombre de nuits initial
      let nuitsInitiales = 0;
      if (reservationData.date_debut && reservationData.date_fin) {
        const dateDebut = reservationData.date_debut.split(' ')[0];
        const dateFin = reservationData.date_fin.split(' ')[0];
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const diffTime = Math.abs(fin - debut);
        nuitsInitiales = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      const total = reservationData.chambres.reduce((sum, chambre) => {
        // Utiliser le prix du pivot si disponible (pour les relations), sinon le prix de la chambre
        const prixNuit = chambre.pivot?.prix || chambre.prix || 0;
        return sum + (parseFloat(prixNuit) * nuitsInitiales);
      }, 0);
      
      return total > 0 ? total : 0;
    }
    
    return 0;
  };

  // Initialiser le formulaire
  useEffect(() => {
    if (reservation) {
      console.log("📊 Données réservation reçues:", reservation);
      
      // Extraire les chambres depuis le tableau chambres
      const chambresArray = reservation.chambres 
        ? reservation.chambres.map(chambre => chambre.id)
        : [];
      
      const dateDebut = reservation.date_debut ? reservation.date_debut.split(' ')[0] : '';
      const dateFin = reservation.date_fin ? reservation.date_fin.split(' ')[0] : '';
      
      // Calculer le montant total initial
      const montantTotalInitial = calculerMontantTotalInitial(reservation);
      
      console.log("💰 Montant total initial calculé:", montantTotalInitial, "à partir de:", {
        montant_total: reservation.montant_total,
        tarif_template: reservation.tarif_template,
        chambresCount: reservation.chambres?.length,
        nuits: (() => {
          if (dateDebut && dateFin) {
            const debut = new Date(dateDebut);
            const fin = new Date(dateFin);
            return Math.ceil(Math.abs(fin - debut) / (1000 * 60 * 60 * 24));
          }
          return 0;
        })()
      });
      
      setFormData({
        id_client: reservation.id_client || '',
        id_chambre: chambresArray,
        date_debut: dateDebut,
        date_fin: dateFin,
        statut: reservation.statut || 'en_attente',
        montant_total: montantTotalInitial,
        acompte: reservation.acompte || 0,
        check_in_time: reservation.check_in_time ? 
          reservation.check_in_time.replace(' ', 'T').substring(0, 16) : '',
        check_out_time: reservation.check_out_time ? 
          reservation.check_out_time.replace(' ', 'T').substring(0, 16) : ''
      });
      
      setErrors({});
      
      // Charger les chambres disponibles pour les dates initiales
      if (dateDebut && dateFin) {
        fetchChambresDisponibles(dateDebut, dateFin);
      }
    }
  }, [reservation]);

  // Fonction pour récupérer les chambres disponibles
  const fetchChambresDisponibles = async (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) {
      setChambresDisponibles([]);
      return;
    }
    
    setLoadingChambres(true);
    setErrorChambres(null);
    
    try {
      console.log("🔍 Recherche chambres disponibles du", dateDebut, "au", dateFin);
      
      const chambres = await getChambresEditDisponibles(dateDebut, dateFin);
      
      console.log("✅ Chambres disponibles reçues:", chambres);
      
      if (chambres && Array.isArray(chambres)) {
        // Formater les chambres pour l'affichage
        const formattedChambres = chambres.map(chambre => ({
          id: chambre.id,
          numero: chambre.numero || `Chambre ${chambre.id}`,
          type: chambre.typeChambreNom || chambre.type?.nom || 'Standard',
          tarif_nuit: chambre.prix || chambre.tarif_nuit || 0,
          status: chambre.status || 'libre'
        }));
        
        console.log("📊 Chambres formatées:", formattedChambres);
        setChambresDisponibles(formattedChambres);
        
        // Mettre à jour le montant total avec les nouvelles informations de tarif
        if (formData.id_chambre.length > 0) {
          const nouveauMontant = calculerMontantTotal();
          if (nouveauMontant > 0 && nouveauMontant !== formData.montant_total) {
            console.log("🔄 Mise à jour montant total après chargement chambres:", nouveauMontant);
            setFormData(prev => ({
              ...prev,
              montant_total: nouveauMontant
            }));
          }
        }
      } else {
        console.warn("❌ Aucune chambre disponible reçue ou format incorrect");
        setChambresDisponibles([]);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la recherche des chambres:", error);
      setErrorChambres(error.message || "Erreur lors de la recherche des chambres disponibles");
      setChambresDisponibles([]);
    } finally {
      setLoadingChambres(false);
    }
  };

  // Calculer le nombre de nuits
  const calculerNuits = () => {
    if (!formData.date_debut || !formData.date_fin) return 0;
    
    const debut = new Date(formData.date_debut);
    const fin = new Date(formData.date_fin);
    const diffTime = Math.abs(fin - debut);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculer le montant total automatiquement
  const calculerMontantTotal = (chambresIds = formData.id_chambre) => {
    const nuits = calculerNuits();
    if (nuits === 0 || chambresIds.length === 0) return 0;
    
    let total = 0;
    chambresIds.forEach(chambreId => {
      // Chercher d'abord dans les chambres disponibles
      const chambreDisponible = chambresDisponibles.find(c => c.id === chambreId);
      if (chambreDisponible && chambreDisponible.tarif_nuit) {
        total += parseFloat(chambreDisponible.tarif_nuit) * nuits;
      } else {
        // Si pas dans les chambres disponibles, chercher dans allChambres
        const chambreExistante = allChambres.find(c => c.id === chambreId);
        if (chambreExistante) {
          // Chercher le prix dans différentes propriétés possibles
          const tarifNuit = chambreExistante.prix || 
                            chambreExistante.tarif_nuit || 
                            (chambreExistante.type?.prix_nuit) || 
                            0;
          total += parseFloat(tarifNuit) * nuits;
        } else {
          // Si la chambre n'est trouvée nulle part, chercher dans la réservation originale
          const chambreReservation = reservation?.chambres?.find(c => c.id === chambreId);
          if (chambreReservation) {
            const tarifNuit = chambreReservation.pivot?.prix || 
                              chambreReservation.prix || 
                              0;
            total += parseFloat(tarifNuit) * nuits;
          }
        }
      }
    });
    
    console.log("🧮 Calcul montant total:", {
      chambresIds,
      nuits,
      total,
      chambresDisponiblesCount: chambresDisponibles.length,
      allChambresCount: allChambres.length
    });
    
    return total;
  };

  // Mettre à jour le montant total quand les chambres ou dates changent
  useEffect(() => {
    if (formData.id_chambre.length > 0 && formData.date_debut && formData.date_fin) {
      const nouveauMontant = calculerMontantTotal();
      if (nouveauMontant !== formData.montant_total) {
        console.log("🔄 Mise à jour automatique montant total:", nouveauMontant);
        setFormData(prev => ({
          ...prev,
          montant_total: nouveauMontant
        }));
      }
    } else if (formData.id_chambre.length === 0) {
      // Si aucune chambre n'est sélectionnée, montant total = 0
      setFormData(prev => ({
        ...prev,
        montant_total: 0
      }));
    }
  }, [formData.id_chambre, formData.date_debut, formData.date_fin, chambresDisponibles]);

  // Quand les dates changent
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedFormData);

    // Effacer l'erreur
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Si les deux dates sont définies, chercher les chambres disponibles
    if (name === 'date_debut' || name === 'date_fin') {
      const dateDebut = name === 'date_debut' ? value : updatedFormData.date_debut;
      const dateFin = name === 'date_fin' ? value : updatedFormData.date_fin;
      
      if (dateDebut && dateFin) {
        // Valider que la date de fin est après la date de début
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        
        if (fin > debut) {
          fetchChambresDisponibles(dateDebut, dateFin);
        } else if (fin <= debut) {
          // Si la date de fin est avant ou égale à la date de début, vider la liste
          setChambresDisponibles([]);
        }
      }
    }
  };

  // Gérer les changements dans les champs (seulement pour les champs modifiables)
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'date_debut' || name === 'date_fin') {
      handleDateChange(e);
    } else if (name === 'check_in_time' || name === 'check_out_time') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Effacer l'erreur
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Ajouter une chambre
  const handleAddChambre = () => {
    if (!selectedChambre) return;
    
    const chambreId = parseInt(selectedChambre);
    
    if (!formData.id_chambre.includes(chambreId)) {
      const nouvellesChambres = [...formData.id_chambre, chambreId];
      
      // Le montant total sera recalculé automatiquement par useEffect
      setFormData(prev => ({
        ...prev,
        id_chambre: nouvellesChambres
      }));
    }
    
    setSelectedChambre('');
  };

  // Supprimer une chambre
  const handleRemoveChambre = (chambreId) => {
    const nouvellesChambres = formData.id_chambre.filter(id => id !== chambreId);
    
    // Le montant total sera recalculé automatiquement par useEffect
    setFormData(prev => ({
      ...prev,
      id_chambre: nouvellesChambres
    }));
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_client) {
      newErrors.id_client = 'Le client est requis';
    }

    if (formData.id_chambre.length === 0) {
      newErrors.id_chambre = 'Au moins une chambre est requise';
    }

    if (!formData.date_debut) {
      newErrors.date_debut = 'La date de début est requise';
    }

    if (!formData.date_fin) {
      newErrors.date_fin = 'La date de fin est requise';
    }

    if (formData.date_debut && formData.date_fin) {
      const debut = new Date(formData.date_debut);
      const fin = new Date(formData.date_fin);
      
      if (fin <= debut) {
        newErrors.date_fin = 'La date de fin doit être après la date de début';
      }
    }

    // Note: On ne valide plus l'acompte car il est en lecture seule
    // Le backend gérera la cohérence

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Préparer les données pour l'API selon le format attendu
    const updateData = {
      id_client: parseInt(formData.id_client),
      id_chambre: formData.id_chambre.join(','), // Format "1,2" comme dans l'image
      date_debut: formData.date_debut,
      date_fin: formData.date_fin,
      statut: formData.statut, // Lecture seule, mais toujours envoyé
      check_in_time: formData.check_in_time ? formData.check_in_time.split('T')[0] : null,
      check_out_time: formData.check_out_time ? formData.check_out_time.split('T')[0] : null,
      montant_total: parseFloat(formData.montant_total),
      acompte: parseFloat(formData.acompte) // Lecture seule, mais toujours envoyé
      // montant_restant sera calculé côté serveur
    };

    console.log("📤 Données à envoyer:", updateData);
    onSubmit(updateData);
  };

  // Formater le prix en Ariary
  const formatAriary = (amount) => {
    return new Intl.NumberFormat('mg-MG').format(Math.round(amount)) + ' Ar';
  };

  const nuits = calculerNuits();
  const montantRestant = formData.montant_total - formData.acompte;
  const pourcentagePaye = formData.montant_total > 0 ? (formData.acompte / formData.montant_total) * 100 : 0;

  // Fonction pour afficher le statut de manière lisible
  const getStatutLabel = (statut) => {
    const statuts = {
      'en_attente': '⏳ En attente',
      'confirmée': '✅ Confirmée',
      'confirméé': '✅ Confirmée',
      'check_in': '🏨 Check-in',
      'check_out': '🚪 Check-out',
      'annulée': '❌ Annulée'
    };
    return statuts[statut] || statut;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaBed className="mr-3 text-blue-500" />
          Modifier la Réservation #{reservation?.id}
        </h2>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          type="button"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      {/* Informations client */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center mb-2">
          <FaUser className="text-blue-500 mr-2" />
          <h3 className="font-semibold text-blue-800">Client</h3>
        </div>
        <div className="text-sm text-blue-700">
          <div className="font-medium">
            {reservation?.client?.prenom} {reservation?.client?.nom}
          </div>
          <div className="text-blue-600">{reservation?.client?.email}</div>
          <div className="text-blue-500">{reservation?.client?.tel}</div>
          <div className="text-blue-400 text-xs mt-1">CIN: {reservation?.client?.cin}</div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Dates */}
        <div>
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="text-green-500 mr-2" />
            <h3 className="font-semibold text-gray-700">Dates de séjour</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'arrivée *
              </label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleDateChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.date_debut ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.date_debut && (
                <p className="text-red-500 text-sm mt-1">{errors.date_debut}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de départ *
              </label>
              <input
                type="date"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleDateChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.date_fin ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.date_fin && (
                <p className="text-red-500 text-sm mt-1">{errors.date_fin}</p>
              )}
            </div>
          </div>
          {nuits > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
              <div className="text-sm font-medium text-green-700">
                {nuits} nuit(s) - Du {new Date(formData.date_debut).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} au {new Date(formData.date_fin).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}
        </div>

        {/* Section Chambres */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaBed className="text-green-500 mr-2" />
              <h3 className="font-semibold text-gray-700">Chambres réservées</h3>
            </div>
            <div>
              {loadingChambres && (
                <span className="text-sm text-blue-500 flex items-center">
                  <FaSearch className="mr-1 animate-pulse" />
                  Recherche...
                </span>
              )}
              {errorChambres && (
                <span className="text-sm text-red-500">
                  ⚠️ {errorChambres}
                </span>
              )}
            </div>
          </div>
          
          {/* Liste des chambres sélectionnées */}
          <div className="mb-4">
            {formData.id_chambre.length > 0 ? (
              <div className="space-y-2">
                {formData.id_chambre.map(chambreId => {
                  const chambre = chambresDisponibles.find(c => c.id === chambreId) || 
                                 allChambres.find(c => c.id === chambreId) ||
                                 reservation?.chambres?.find(c => c.id === chambreId);
                  const tarifNuit = chambre?.tarif_nuit || chambre?.prix || chambre?.pivot?.prix || 0;
                  const totalChambre = tarifNuit * nuits;
                  
                  return (
                    <div 
                      key={chambreId} 
                      className="flex items-center justify-between bg-blue-50 text-blue-800 px-4 py-3 rounded-lg border border-blue-100"
                    >
                      <div>
                        <span className="font-medium">
                          Chambre {chambre?.numero || chambreId} 
                          {chambre?.type ? (chambre.type.nom ? ` (${chambre.type.nom})` : ` (${chambre.type})`) : ''}
                        </span>
                        <div className="text-sm text-blue-600">
                          {formatAriary(tarifNuit)}/nuit × {nuits} nuit(s) = {formatAriary(totalChambre)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveChambre(chambreId)}
                        className="text-red-500 hover:text-red-700 ml-2 p-2 rounded-full hover:bg-red-50"
                        title="Supprimer cette chambre"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400">
                Aucune chambre sélectionnée
              </div>
            )}
            {errors.id_chambre && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.id_chambre}</p>
            )}
          </div>

          {/* Sélecteur de chambre */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={selectedChambre}
                onChange={(e) => setSelectedChambre(e.target.value)}
                disabled={loadingChambres || !formData.date_debut || !formData.date_fin}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
              >
                <option value="">
                  {!formData.date_debut || !formData.date_fin 
                    ? "Sélectionnez d'abord les dates" 
                    : loadingChambres 
                    ? "Chargement des chambres..." 
                    : chambresDisponibles.length === 0
                    ? "Aucune chambre disponible"
                    : "Sélectionner une chambre"}
                </option>
                {chambresDisponibles
                  .filter(chambre => !formData.id_chambre.includes(chambre.id))
                  .map(chambre => (
                    <option key={chambre.id} value={chambre.id}>
                      Chambre {chambre.numero} - {chambre.type} - {formatAriary(chambre.tarif_nuit)}/nuit
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddChambre}
                disabled={!selectedChambre || loadingChambres}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <FaPlus className="mr-2" />
                Ajouter
              </button>
            </div>
            
            {/* Information sur les chambres disponibles */}
            {formData.date_debut && formData.date_fin && !loadingChambres && (
              <div className="text-sm">
                <div className={`font-medium ${
                  chambresDisponibles.length > 0 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {chambresDisponibles.length > 0 
                    ? `✅ ${chambresDisponibles.length} chambre(s) disponible(s) pour ces dates`
                    : "⚠️ Aucune chambre disponible pour ces dates"
                  }
                </div>
                {formData.id_chambre.length > 0 && (
                  <div className="mt-1 text-gray-600">
                    {formData.id_chambre.length} chambre(s) sélectionnée(s)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section Paiement - CHAMPS EN LECTURE SEULE */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaMoneyBillWave className="text-purple-500 mr-2" />
              <h3 className="font-semibold text-gray-700">Informations de paiement</h3>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <FaLock className="mr-1" />
              Calcul automatique
            </div>
          </div>
          
          {/* Aperçu du calcul */}
          {formData.id_chambre.length > 0 && nuits > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">Détail du calcul :</div>
                {formData.id_chambre.map(chambreId => {
                  const chambre = chambresDisponibles.find(c => c.id === chambreId) || 
                                 allChambres.find(c => c.id === chambreId) ||
                                 reservation?.chambres?.find(c => c.id === chambreId);
                  const tarif = chambre?.tarif_nuit || chambre?.prix || chambre?.pivot?.prix || 0;
                  const totalChambre = tarif * nuits;
                  return (
                    <div key={chambreId} className="flex justify-between text-sm mb-1">
                      <span>Chambre {chambre?.numero || chambreId} ({nuits} nuit(s))</span>
                      <span>{formatAriary(totalChambre)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-300">
                  <span>Total calculé automatiquement</span>
                  <span>{formatAriary(calculerMontantTotal())}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Message si montant total est 0 */}
          {formData.montant_total === 0 && formData.id_chambre.length > 0 && !loadingChambres && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-700">
                <span className="font-medium">ℹ️ Note :</span> Le montant total est actuellement à 0. 
                Il sera calculé automatiquement en fonction des tarifs des chambres.
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant total (Ar)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.montant_total}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <div className="absolute right-3 top-2 text-gray-500">Ar</div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <FaCalculator className="mr-1" />
                {loadingChambres && formData.montant_total === 0 
                  ? "Calcul en cours..." 
                  : "Calculé automatiquement"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acompte payé (Ar)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.acompte}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <div className="absolute right-3 top-2 text-gray-500">Ar</div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <FaLock className="mr-1" />
                Non modifiable via ce formulaire
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant restant
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <div className={`font-medium text-lg ${
                  montantRestant > 0 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {formatAriary(montantRestant)}
                </div>
                {pourcentagePaye > 0 && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(pourcentagePaye, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {pourcentagePaye.toFixed(0)}% payé
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Statut - EN LECTURE SEULE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut de la réservation
            </label>
            <div className="relative">
              <input
                type="text"
                value={getStatutLabel(formData.statut)}
                readOnly
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
              <div className="absolute right-3 top-3 text-gray-500">
                <FaLock />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <FaLock className="mr-1" />
              Non modifiable via ce formulaire
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut du paiement
            </label>
            <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
              <div className={`font-medium text-center ${
                formData.acompte >= formData.montant_total ? 'text-green-600' :
                formData.acompte > 0 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {formData.acompte >= formData.montant_total ? '✅ Payée intégralement' :
                 formData.acompte > 0 ? `⏳ Acompte (${formatAriary(formData.acompte)})` : '❌ Non payée'}
              </div>
            </div>
          </div>
        </div>

        {/* Section Check-in/Check-out - TOUJOURS MODIFIABLE */}
        <div>
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-700">Dates d'arrivée et départ réelles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de check-in réelle
              </label>
              <input
                type="datetime-local"
                name="check_in_time"
                value={formData.check_in_time}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de check-out réelle
              </label>
              <input
                type="datetime-local"
                name="check_out_time"
                value={formData.check_out_time}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Ces dates sont enregistrées automatiquement lors du check-in/check-out réel
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
          >
            <FaTimes className="mr-2" />
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center shadow-md hover:shadow-lg"
          >
            <FaSave className="mr-2" />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReservationForm;