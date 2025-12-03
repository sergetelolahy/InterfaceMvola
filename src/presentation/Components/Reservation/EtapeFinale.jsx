import React, { useState } from 'react';
import { FaCopy, FaPrint, FaEnvelope, FaUser, FaIdCard, FaPhone, FaCalendar, FaCreditCard, FaCheck, FaTimes, FaHotel, FaBed } from 'react-icons/fa';

const EtapeFinale = ({ 
  selection,
  onCreerReservationEtPaiement,
  onNouvelleReservation, 
  onVoirReservations,
  loading,
  error,
  calculerNuits
}) => {
  const [showPaiement, setShowPaiement] = useState(false);
  const [reservationCreee, setReservationCreee] = useState(null);
  
  // Gestion des chambres (singulier ou pluriel)
  const chambres = selection?.chambres || selection?.chambre || [];
  const nuits = selection?.dateDebut && selection?.dateFin ? calculerNuits(selection.dateDebut, selection.dateFin) : 0;
  
  // Calcul du total avec toutes les chambres
  const total = chambres.reduce((sum, chambre) => {
    return sum + (parseFloat(chambre.prix || 0) * nuits * (chambre.quantite || 1));
  }, 0) || 0;
  
  const [donneesPaiement, setDonneesPaiement] = useState({
    montant: total,
    date_paiement: new Date().toISOString().split('T')[0],
    mode_paiement: 'especes',
    status: 'complete' // Défaut correct
  });

  const handlePaiementSubmit = async (e) => {
    e.preventDefault();
    try {
      // ⚠️ CORRECTION : Ajout de logs de débogage
      console.log('🔍 DEBUG - Statut avant validation:', donneesPaiement.status);
      
      // CORRECTION : Validation et conversion des données
      const statusValide = validerStatus(donneesPaiement.status);
      console.log('🔍 DEBUG - Statut après validation:', statusValide);
      
      const donneesValidees = {
        ...donneesPaiement,
        montant: parseFloat(donneesPaiement.montant),
        status: statusValide, // ⚠️ Utiliser la valeur validée
        mode_paiement: validerModePaiement(donneesPaiement.mode_paiement)
      };
      
      console.log('💳 Données paiement validées:', donneesValidees);
      
      const resultat = await onCreerReservationEtPaiement(donneesValidees);
      setReservationCreee(resultat);
      setShowPaiement(false);
    } catch (error) {
      console.error('❌ Erreur dans handlePaiementSubmit:', error);
    }
  };

  // ⚠️ CORRECTION COMPLÈTE : Fonction de validation alignée avec Laravel
  const validerStatus = (status) => {
    console.log(`🔄 Validation du statut: "${status}"`);
    
    // Votre base de données Laravel utilise 'complete' et 'partielle'
    const statusValides = ['complete', 'partielle'];
    
    // Si le statut est déjà valide, on le retourne tel quel
    if (statusValides.includes(status)) {
      console.log(`✅ Statut déjà valide: "${status}"`);
      return status;
    }
    
    // Mapping des statuts vers les valeurs acceptées par Laravel
    const mapping = {
      'complet': 'complete',      // 'complet' (français) devient 'complete' (anglais)
      'partiel': 'partielle',     // 'partiel' (français) devient 'partielle' (anglais)
      'total': 'complete',        // 'total' devient 'complete'
      'validé': 'complete',       // 'validé' devient 'complete'
      'en attente': 'complete',   // 'en attente' devient 'complete'
      'acompte': 'partielle'      // 'acompte' devient 'partielle'
    };
    
    const statutCorrige = mapping[status] || 'complete';
    console.log(`🔄 Statut corrigé: "${status}" -> "${statutCorrige}"`);
    return statutCorrige;
  };

  const validerModePaiement = (mode) => {
    return mode.substring(0, 50);
  };

  const handlePaiementChange = (e) => {
    const { name, value } = e.target;
    setDonneesPaiement(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copié !');
  };

  // Fonction pour normaliser les données de réservation créée
  const getReservationData = () => {
    if (!reservationCreee) return null;

    return {
      // Données de paiement
      id: reservationCreee.id,
      montant: reservationCreee.montant,
      date_paiement: reservationCreee.date_paiement,
      mode_paiement: reservationCreee.mode_paiement,
      status: reservationCreee.status,
      
      // Données de réservation
      reservation: reservationCreee.reservation || {},
      client: reservationCreee.client || reservationCreee.reservation?.client || selection.client,
      chambres: reservationCreee.chambres || reservationCreee.reservation?.chambres || chambres,
      
      // Dates et calculs
      dates: reservationCreee.dates || {
        dateDebut: reservationCreee.reservation?.date_debut || selection.dateDebut,
        dateFin: reservationCreee.reservation?.date_fin || selection.dateFin
      },
      nuits: reservationCreee.nuits || nuits,
      total: reservationCreee.total || total
    };
  };

  const renderChambresSelectionnees = () => {
    if (!chambres || chambres.length === 0) {
      return <div className="text-red-500">Aucune chambre sélectionnée</div>;
    }

    return (
      <div className="space-y-3">
        {chambres.map((chambre, index) => (
          <div key={chambre.id || index} className="flex justify-between items-center pb-2 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <FaBed className="text-blue-500" />
              <div>
                <span className="font-semibold text-gray-800">Chambre {chambre.numero}</span>
                <div className="text-sm text-gray-600 capitalize">
                  {chambre.type?.nom || chambre.typechambre?.nom || 'Standard'} 
                  {chambre.quantite > 1 && ` × ${chambre.quantite}`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">{chambre.prix}€/nuit</div>
              <div className="text-sm text-gray-600">
                Sous-total: {(chambre.prix * nuits * (chambre.quantite || 1)).toFixed(2)}€
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Utiliser les données normalisées
  const reservationData = getReservationData();

  if (reservationData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-2">Réservation Confirmée !</h1>
          <p className="text-green-100 text-lg">
            Votre réservation a été créée et le paiement enregistré avec succès
          </p>
        </div>

        <div className="p-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaIdCard className="text-blue-500" />
                  Numéro de réservation
                </h2>
                <p className="text-gray-600 mt-1">Conservez ce numéro pour toute référence</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-600 bg-white px-4 py-2 rounded-lg border border-blue-300">
                  {reservationData.reservation.id}
                </span>
                <button
                  onClick={() => copyToClipboard(reservationData.reservation.id.toString())}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                  title="Copier le numéro"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                Informations du client
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Nom complet</span>
                  <span className="font-semibold text-gray-800">
                    {reservationData.client.prenom} {reservationData.client.nom}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold text-gray-800">{reservationData.client.email}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Téléphone</span>
                  <span className="font-semibold text-gray-800">{reservationData.client.tel || reservationData.client.telephone || 'Non renseigné'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaIdCard className="text-orange-500" />
                    CIN
                  </span>
                  <span className="font-semibold text-gray-800 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    {reservationData.client.cin || 'Non renseigné'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendar className="text-green-500" />
                Détails du séjour
              </h3>
              
              <div className="space-y-3">
                <div className="pb-2 border-b border-gray-200">
                  <span className="text-gray-600 block mb-2">Chambres réservées</span>
                  <div className="space-y-2">
                    {reservationData.chambres.map((chambre, index) => (
                      <div key={chambre.id || index} className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">
                          Chambre {chambre.numero}
                          {chambre.quantite > 1 && ` × ${chambre.quantite}`}
                        </span>
                        <span className="text-gray-600 capitalize text-sm">
                          {chambre.type?.nom || chambre.typechambre?.nom || 'Standard'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Arrivée</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(reservationData.dates.dateDebut)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Départ</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(reservationData.dates.dateFin)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Durée</span>
                  <span className="font-semibold text-green-600">
                    {reservationData.nuits} nuit{reservationData.nuits > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCreditCard className="text-purple-500" />
              Résumé financier
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border text-center">
                <p className="text-sm text-gray-600">Prix total par nuit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reservationData.nuits > 0 ? (reservationData.total / reservationData.nuits).toFixed(2) : 0}€
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border text-center">
                <p className="text-sm text-gray-600">Nombre de nuits</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservationData.nuits}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border text-center">
                <p className="text-sm text-gray-600">Total payé</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reservationData.montant}€
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <div className="text-green-500 text-4xl mb-2">✅</div>
              <h4 className="font-semibold text-green-800 text-lg mb-2">Paiement Enregistré !</h4>
              <p className="text-green-700">
                Le paiement de <strong>{reservationData.montant}€</strong> a été enregistré avec succès.
              </p>
              <p className="text-green-600 text-sm mt-1">
                Mode: {reservationData.mode_paiement} • Statut: {reservationData.status}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onNouvelleReservation}
              className="flex-1 bg-blue-500 text-white py-4 px-6 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <FaUser className="text-sm" />
              Faire une nouvelle réservation
            </button>
            
            <button
              onClick={onVoirReservations}
              className="flex-1 bg-gray-500 text-white py-4 px-6 rounded-xl hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <FaCalendar className="text-sm" />
              Voir toutes les réservations
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex-1 bg-green-500 text-white py-4 px-6 rounded-xl hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <FaPrint className="text-sm" />
              Imprimer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white text-center">
        <div className="text-6xl mb-4">📋</div>
        <h1 className="text-3xl font-bold mb-2">Création de la Réservation</h1>
        <p className="text-blue-100 text-lg">
          Vérifiez les informations et procédez au paiement
        </p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Informations du client
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Nom complet</span>
                <span className="font-semibold text-gray-800">
                  {selection.client?.prenom} {selection.client?.nom}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold text-gray-800">{selection.client?.email}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Téléphone</span>
                <span className="font-semibold text-gray-800">{selection.client?.tel || selection.client?.telephone || 'Non renseigné'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <FaIdCard className="text-orange-500" />
                  CIN
                </span>
                <span className="font-semibold text-gray-800 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  {selection.client?.cin || 'Non renseigné'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaHotel className="text-green-500" />
              Détails du séjour
            </h3>
            
            <div className="space-y-3">
              <div className="pb-2 border-b border-gray-200">
                <span className="text-gray-600 block mb-2">Chambres sélectionnées</span>
                {renderChambresSelectionnees()}
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Arrivée</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(selection.dateDebut)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Départ</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(selection.dateFin)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Durée</span>
                <span className="font-semibold text-green-600">
                  {nuits} nuit{nuits > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCreditCard className="text-purple-500" />
            Résumé financier
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border text-center">
              <p className="text-sm text-gray-600">Prix total par nuit</p>
              <p className="text-2xl font-bold text-blue-600">
                {nuits > 0 ? (total / nuits).toFixed(2) : 0}€
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border text-center">
              <p className="text-sm text-gray-600">Nombre de nuits</p>
              <p className="text-2xl font-bold text-green-600">
                {nuits}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border text-center">
              <p className="text-sm text-gray-600">Total à payer</p>
              <p className="text-2xl font-bold text-purple-600">
                {total}€
              </p>
            </div>
          </div>

          {!showPaiement ? (
            <div className="text-center">
              <button
                onClick={() => setShowPaiement(true)}
                className="bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors font-semibold flex items-center gap-2 mx-auto"
              >
                <FaCreditCard />
                Enregistrer le paiement et créer la réservation
              </button>
              <p className="text-gray-500 text-sm mt-2">
                Cliquez pour finaliser la réservation et enregistrer le paiement
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Enregistrement du paiement</h4>
                <button
                  onClick={() => setShowPaiement(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handlePaiementSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant payé *
                    </label>
                    <input
                      type="number"
                      name="montant"
                      value={donneesPaiement.montant}
                      onChange={handlePaiementChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de paiement *
                    </label>
                    <input
                      type="date"
                      name="date_paiement"
                      value={donneesPaiement.date_paiement}
                      onChange={handlePaiementChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mode de paiement *
                    </label>
                    <select
                      name="mode_paiement"
                      value={donneesPaiement.mode_paiement}
                      onChange={handlePaiementChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="especes">Espèces</option>
                      <option value="carte">Carte bancaire</option>
                      <option value="cheque">Chèque</option>
                      <option value="virement">Virement</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut du paiement *
                    </label>
                    <select
                      name="status"
                      value={donneesPaiement.status}
                      onChange={handlePaiementChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="complete">Complet</option>
                      <option value="partielle">Partiel</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      ⚠️ Ces valeurs correspondent aux options de votre base de données
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaiement(false)}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Création...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        Créer la réservation et enregistrer le paiement
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EtapeFinale;