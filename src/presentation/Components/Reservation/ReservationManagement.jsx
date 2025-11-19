import React, { useState, useEffect } from 'react';
import { FaCheck, FaArrowLeft, FaHotel, FaCreditCard } from 'react-icons/fa';
import EtapeRecherche from './EtapeRecherche';
import EtapeSelection from './EtapeSelection';
import EtapeConfirmation from './EtapeConfirmation';
import EtapeFinale from './EtapeFinale';
import ListeReservations from './ListeReservations';
import { useChambres } from '../../hooks/useChambres';
import { useReservations } from '../../hooks/useReservation';
import { useClients } from '../../hooks/useClients';
import { usePaiement } from '../../hooks/usePaiement';

const ReservationManagement = () => {
  const { chambres, loading: chambresLoading, getChambresDisponibles } = useChambres();
  const { reservations, loading: reservationsLoading, createReservation } = useReservations();
  const { createClient } = useClients();
  const { createPaiement, loading: paiementLoading } = usePaiement();

  const [etapeActuelle, setEtapeActuelle] = useState('liste');
  const [selection, setSelection] = useState({
    chambre: [], // ⚠️ CORRECTION : Tableau pour plusieurs chambres
    dateDebut: '',
    dateFin: '',
    client: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calcul du nombre de nuits
  const calculerNuits = (dateDebut, dateFin) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Navigation étapes
  const demarrerNouvelleReservation = () => {
    setSelection({
      chambre: [], // ⚠️ CORRECTION : Tableau vide
      dateDebut: '',
      dateFin: '',
      client: null
    });
    setEtapeActuelle('recherche');
  };
  
  const annulerRecherche = () => setEtapeActuelle('liste');
  const retourEtapeRecherche = () => setEtapeActuelle('recherche');
  const retourEtapeSelection = () => setEtapeActuelle('selection');

  // Recherche chambres disponibles
  const rechercherChambresDisponibles = async (dateDebut, dateFin) => {
    setSelection(prev => ({ ...prev, dateDebut, dateFin }));
    await getChambresDisponibles(dateDebut, dateFin);
    setEtapeActuelle('selection');
  };

  // ⚠️ CORRECTION : Sélection de plusieurs chambres
  const selectionnerChambres = (chambresSelectionnees) => {
    console.log('🔍 Chambres sélectionnées:', chambresSelectionnees);
    setSelection(prev => ({ ...prev, chambre: chambresSelectionnees }));
    setEtapeActuelle('confirmation');
  };

  // Confirmer le client (sans créer la réservation)
  const confirmerClient = async (donneesClient) => {
    setLoading(true);
    setError(null);
    
    try {
      let clientId = donneesClient.id;

      // Si le client n'a pas d'ID, c'est un nouveau client
      if (!clientId) {
        const nouveauClient = await createClient({
          nom: donneesClient.nom,
          prenom: donneesClient.prenom,
          email: donneesClient.email,
          tel: donneesClient.telephone,
          cin: donneesClient.cin
        });
        
        clientId = nouveauClient.id || nouveauClient.data?.id;
      }

      // Mettre à jour la sélection avec le client
      setSelection(prev => ({
        ...prev,
        client: { ...donneesClient, id: clientId }
      }));

      // Passer à l'étape finale pour créer réservation + paiement
      setEtapeActuelle('finale');
      
    } catch (error) {
      console.error('❌ Erreur création client:', error);
      setError(error.message || 'Erreur lors de la création du client');
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ CORRECTION : Créer la réservation avec plusieurs chambres
  const creerReservationEtPaiement = async (donneesPaiement) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 DEBUG - selection:', selection);
      console.log('🔍 DEBUG - chambres:', selection.chambre);

      if (!selection.client || !selection.chambre || selection.chambre.length === 0) {
        throw new Error('Données de réservation incomplètes: client ou chambres manquants');
      }

      // ⚠️ CORRECTION : Formater les IDs des chambres comme dans Postman : "1,2"
      const idChambres = selection.chambre.map(chambre => chambre.id).join(',');
      console.log('🔍 IDs chambres formatés:', idChambres);

      // Calculer le total pour toutes les chambres
      const nuits = calculerNuits(selection.dateDebut, selection.dateFin);
      const totalChambres = selection.chambre.reduce((total, chambre) => {
        const quantite = chambre.quantite || 1;
        return total + (chambre.prix * nuits * quantite);
      }, 0);

      // 1. Créer la réservation
      const reservationData = {
        id_client: selection.client.id,
        id_chambre: idChambres, // ⚠️ CORRECTION : Chaîne formatée "1,2"
        date_debut: selection.dateDebut,
        date_fin: selection.dateFin,
        statut: "en_attente",
        tarif_template: Math.round(totalChambres) // Utiliser le total calculé
      };

      console.log('📤 Création réservation:', reservationData);

      const nouvelleReservation = await createReservation(reservationData);
      
      console.log('✅ Réservation créée:', nouvelleReservation);

      // 2. Créer le paiement
      const paiementData = {
        id_reservation: nouvelleReservation.id,
        montant: donneesPaiement.montant,
        date_paiement: donneesPaiement.date_paiement,
        mode_paiement: donneesPaiement.mode_paiement,
        status: donneesPaiement.status
      };

      console.log('💳 Création paiement:', paiementData);

      await createPaiement(paiementData);

      console.log('✅ Paiement et réservation confirmés avec succès');
      
      // ⚠️ CORRECTION : Retourner les données complètes avec toutes les chambres
      return {
        reservation: nouvelleReservation,
        client: selection.client,
        chambres: selection.chambre, // ⚠️ Tableau de chambres
        dates: {
          dateDebut: selection.dateDebut,
          dateFin: selection.dateFin
        },
        nuits: nuits,
        total: totalChambres,
        paiement: paiementData
      };
      
    } catch (error) {
      console.error('❌ Erreur création réservation/paiement:', error);
      setError(error.response?.data?.message || error.message || 'Erreur lors de la création de la réservation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const annulerReservation = () => {
    setSelection({ 
      chambre: [], // ⚠️ CORRECTION : Tableau vide
      dateDebut: '', 
      dateFin: '', 
      client: null 
    });
    setEtapeActuelle('liste');
  };

  // Affichage étapes
  const renderEtape = () => {
    switch (etapeActuelle) {
      case 'recherche':
        return (
          <EtapeRecherche 
            onRecherche={rechercherChambresDisponibles} 
            onCancel={annulerRecherche} 
            loading={chambresLoading} 
          />
        );
      case 'selection':
        return (
          <EtapeSelection 
            chambres={chambres} 
            dates={selection} 
            onSelect={selectionnerChambres} // ⚠️ CORRECTION : Nom de fonction
            onBack={retourEtapeRecherche} 
            calculerNuits={calculerNuits} 
          />
        );
      case 'confirmation':
        return (
          <EtapeConfirmation 
            selection={selection} 
            onConfirm={confirmerClient} 
            onBack={retourEtapeSelection} 
            loading={loading} 
            calculerNuits={calculerNuits}
            error={error}
          />
        );
      case 'finale':
        return (
          <EtapeFinale 
            selection={selection}
            onCreerReservationEtPaiement={creerReservationEtPaiement}
            onNouvelleReservation={demarrerNouvelleReservation}
            onVoirReservations={() => setEtapeActuelle('liste')}
            loading={loading || paiementLoading}
            error={error}
            calculerNuits={calculerNuits}
          />
        );
      default:
        return (
          <ListeReservations 
            reservations={reservations} 
            onNouvelleReservation={demarrerNouvelleReservation} 
            loading={reservationsLoading} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header etapeActuelle={etapeActuelle} />
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        <div className="fade-in">{renderEtape()}</div>
      </div>
    </div>
  );
};

// Navbar et Header restent identiques...
const Navbar = () => (
  <nav className="bg-white shadow-lg py-3 px-6 mb-6">
    <div className="flex items-center gap-2">
      <FaHotel className="text-blue-500 text-xl" />
      <span className="font-bold text-lg">Gestion des Réservations</span>
    </div>
  </nav>
);

const Header = ({ etapeActuelle }) => {
  const titres = {
    recherche: 'Nouvelle Réservation',
    selection: 'Sélection de Chambre',
    confirmation: 'Finalisation',
    finale: 'Création Réservation & Paiement',
    liste: 'Liste des Réservations'
  };
  const sousTitres = {
    recherche: 'Recherchez les chambres disponibles',
    selection: 'Choisissez une ou plusieurs chambres', // ⚠️ CORRECTION : texte
    confirmation: 'Recherchez ou créez un client',
    finale: 'Créez la réservation et enregistrez le paiement',
    liste: 'Gérez les réservations et consultez les chambres disponibles'
  };
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800">{titres[etapeActuelle]}</h1>
      <p className="text-gray-600 mt-2">{sousTitres[etapeActuelle]}</p>
    </div>
  );
};

export default ReservationManagement;